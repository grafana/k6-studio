import { useChat } from '@ai-sdk/react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { applyRules } from '@/rules/rules'
import {
  selectFilteredRequests,
  selectGeneratorData,
  useGeneratorStore,
} from '@/store/generator'
import { AiCorrelationRule } from '@/types/autoCorrelation'
import { CorrelationRule } from '@/types/rules'
import { exhaustive } from '@/utils/typescript'
import { validateScript } from '@/utils/validateScript'

import { generateScriptPreview } from '../Generator.utils'

import { systemPrompt } from './constants'
import { CorrelationStatus, Message, ToolCall } from './types'
import { IPCChatTransport } from './utils/IPCChatTransport'
import { lastMessageIsToolCall } from './utils/lastMessageIsToolCall'
import { prepareRequestsForAI } from './utils/stripRequestData'
import { validationMatchesRecording } from './utils/validationMatchesRecording'

export const useGenerateRules = ({
  clearValidation,
}: {
  clearValidation: () => void
}) => {
  const [suggestedRules, setSuggestedRules] = useState<CorrelationRule[]>([])
  const [isValidationSuccessful, setIsValidationSuccessful] = useState(false)
  const [correlationStatus, setCorrelationStatus] =
    useState<CorrelationStatus>('not-started')
  const [outcomeReason, setOutcomeReason] = useState('')
  const suggestedRulesRef = useRef(suggestedRules)
  const abortControllerRef = useRef<AbortController | null>(null)
  const recording = useGeneratorStore(selectFilteredRequests)
  const generator = useGeneratorStore(selectGeneratorData)

  suggestedRulesRef.current = suggestedRules

  const {
    sendMessage,
    error,
    addToolResult,
    status,
    stop: stopGeneration,
  } = useChat<Message>({
    transport: new IPCChatTransport(),
    // Keep calling tools without user input
    sendAutomaticallyWhen: lastMessageIsToolCall,
    onError: (error) => {
      setCorrelationStatus('error')
      setOutcomeReason('An error occurred during auto-correlation.')
      console.error(error)
    },
    onToolCall: async ({ toolCall }) => {
      // Narrow down to static tool calls only
      if (toolCall.dynamic) {
        return
      }

      const toolCallWithType = {
        ...toolCall,
        type: 'tool-call' as const,
      }

      setCorrelationStatus(toolCallToStep(toolCallWithType))
      const toolResult = await handleToolCall(toolCallWithType)

      void addToolResult({
        tool: toolCall.toolName,
        toolCallId: toolCall.toolCallId,
        output: toolResult,
      })
    },
  })

  async function handleToolCall(toolCall: ToolCall) {
    const { toolName } = toolCall

    switch (toolName) {
      case 'addRule': {
        return addRule(toolCall.input.rule)
      }

      case 'getRecording': {
        const { startIndex, endIndex } = toolCall.input
        const recordingSlice = recording.slice(startIndex, endIndex)

        return prepareRequestsForAI(recordingSlice)
      }

      case 'runValidation': {
        return runValidation()
      }

      case 'finish':
        setOutcomeReason(toolCall.input.reason)
        return

      default:
        return exhaustive(toolName)
    }
  }

  function addRule(rule: AiCorrelationRule) {
    const applyResult = applyRules(recording, [
      ...suggestedRulesRef.current,
      rule,
    ])

    const matchedRequestsIds =
      applyResult.ruleInstances[0]?.state.matchedRequestIds

    if (!matchedRequestsIds || matchedRequestsIds.length === 0) {
      return []
    }

    setSuggestedRules((prev) => [...prev, rule])
    return matchedRequestsIds
  }

  async function runValidation() {
    clearValidation()
    const script = await generateScriptPreview(
      {
        ...generator,
        rules: [...generator.rules, ...suggestedRulesRef.current],
      },
      recording
    )

    const validationResult = await validateScript(
      script,
      abortControllerRef.current?.signal
    )

    const result = validationMatchesRecording(recording, validationResult)
    setIsValidationSuccessful(result.success)
    return result
  }

  const isLoading = [
    'validating',
    'analyzing',
    'creating-rules',
    'finalizing',
  ].includes(correlationStatus)

  async function start() {
    setIsValidationSuccessful(false)
    setCorrelationStatus('validating')

    try {
      const validationResult = await runValidation()

      if (validationResult.success) {
        setCorrelationStatus('correlation-not-needed')
        setOutcomeReason(
          'The script validation passed successfully. The current generator configuration is sufficient to handle all requests in the recording, so no additional auto-generated correlation rules are required.'
        )
        return
      }

      // TODO: we are sending just one failing request for context, should we send all?
      return sendMessage({
        text: `${systemPrompt} \n\n Validation result: ${JSON.stringify(validationResult)}`,
      })
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }
      console.error(error)
      setCorrelationStatus('error')
      setOutcomeReason('An error occurred during auto-correlation.')
    }
  }
  function stop() {
    void stopGeneration()
    setCorrelationStatus('aborted')
    abortControllerRef.current?.abort()
  }

  useEffect(() => {
    abortControllerRef.current = new AbortController()
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  return {
    start,
    error,
    status,
    suggestedRules,
    isValid: isValidationSuccessful,
    isLoading,
    correlationStatus,
    outcomeReason,
    stop: useCallback(stop, [stopGeneration]),
  }
}

function toolCallToStep(toolCall: ToolCall): CorrelationStatus {
  const { toolName } = toolCall
  switch (toolName) {
    case 'runValidation':
      return 'validating'
    case 'getRecording':
      return 'analyzing'
    case 'addRule':
      return 'creating-rules'
    case 'finish':
      return toolCall.input.outcome
    default:
      return exhaustive(toolName)
  }
}
