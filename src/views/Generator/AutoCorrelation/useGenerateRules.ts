import { useChat } from '@ai-sdk/react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { applyRules } from '@/rules/rules'
import { UsageEventName } from '@/services/usageTracking/types'
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
import {
  getRequestDetails,
  getRequestsMetadata,
  searchRequests,
} from './utils/searchTools'
import { prepareRequestsForAI } from './utils/stripRequestData'
import { validationMatchesRecording } from './utils/validationMatchesRecording'

const outcomeEvents = {
  success: UsageEventName.AutocorrelationSucceeded,
  'partial-success': UsageEventName.AutocorrelationPartiallySucceeded,
  failure: UsageEventName.AutocorrelationFailed,
} as const

const LOADING_STATES: CorrelationStatus[] = [
  'validating',
  'analyzing',
  'creating-rules',
  'finalizing',
]

export const useGenerateRules = ({
  clearValidation,
}: {
  clearValidation: () => void
}) => {
  const [suggestedRules, setSuggestedRules] = useState<CorrelationRule[]>([])
  const [correlationStatus, setCorrelationStatus] =
    useState<CorrelationStatus>('not-started')
  const [outcomeReason, setOutcomeReason] = useState('')
  const suggestedRulesRef = useRef(suggestedRules)
  const correlationStatusRef = useRef(correlationStatus)
  const abortControllerRef = useRef<AbortController | null>(null)
  const recording = useGeneratorStore(selectFilteredRequests)
  const generator = useGeneratorStore(selectGeneratorData)

  // Sync refs after commit (not during render) so aborted renders in
  // concurrent mode can't leave refs pointing at uncommitted state.
  useEffect(() => {
    suggestedRulesRef.current = suggestedRules
  })

  useEffect(() => {
    correlationStatusRef.current = correlationStatus
  })

  const {
    sendMessage,
    error,
    addToolOutput,
    status,
    stop: stopGeneration,
    clearError,
    setMessages,
  } = useChat<Message>({
    transport: new IPCChatTransport(),

    // Keep calling tools without user input
    sendAutomaticallyWhen: lastMessageIsToolCall,
    onError: (error) => {
      setCorrelationStatus('error')
      window.studio.app.trackEvent({
        event: UsageEventName.AutocorrelationErrored,
      })
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

      void addToolOutput({
        tool: toolCall.toolName,
        toolCallId: toolCall.toolCallId,
        output: toolResult,
      })
    },
  })

  async function handleToolCall(toolCall: ToolCall) {
    const { toolName } = toolCall

    switch (toolName) {
      case 'addRuleBeginEnd':
      case 'addRuleRegex':
      case 'addRuleJson':
      case 'addRuleHeaderName': {
        return addRule(toolCall.input.rule)
      }

      case 'searchRequests': {
        const { query, limit } = toolCall.input
        return searchRequests(recording, query, limit ?? 20)
      }

      case 'getRequestsMetadata': {
        const { startIndex, endIndex } = toolCall.input
        return getRequestsMetadata(recording, startIndex ?? 0, endIndex)
      }

      case 'getRequestDetails': {
        const { requestIds, fields } = toolCall.input
        return getRequestDetails(recording, requestIds, fields)
      }

      case 'runValidation': {
        return runValidation()
      }

      case 'finish':
        window.studio.app.trackEvent({
          event: outcomeEvents[toolCall.input.outcome],
        })
        setOutcomeReason(toolCall.input.reason)
        return toolCall.input.outcome

      default:
        return exhaustive(toolName)
    }
  }

  function addRule(rule: AiCorrelationRule) {
    const validRule = toCorrelationRule(rule)
    const applyResult = applyRules(recording, [
      ...suggestedRulesRef.current,
      validRule,
    ])

    const matchedRequestsIds =
      applyResult.ruleInstances[0]?.state.matchedRequestIds

    if (!matchedRequestsIds || matchedRequestsIds.length === 0) {
      return 'The provided rule did not match any requests in the recording. Review the rule and try again.'
    }

    setSuggestedRules((prev) => [...prev, validRule])
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
      abortControllerRef.current?.signal,
      false
    )

    const result = validationMatchesRecording(
      prepareRequestsForAI(recording),
      prepareRequestsForAI(validationResult)
    )

    return result
  }

  const isLoading = LOADING_STATES.includes(correlationStatus)

  async function start() {
    window.studio.app.trackEvent({
      event: UsageEventName.AutocorrelationStarted,
    })
    setCorrelationStatus('validating')
    clearError()

    try {
      const validationResult = await runValidation()

      if (validationResult.success) {
        setCorrelationStatus('correlation-not-needed')
        setOutcomeReason(
          'The script validation passed successfully. The current generator configuration is sufficient to handle all requests in the recording, so no additional auto-generated correlation rules are required.'
        )
        return
      }

      setCorrelationStatus('analyzing')
      return sendMessage({
        text: `${systemPrompt} \n\n Validation result: ${JSON.stringify(validationResult)}`,
      })
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }
      console.error(error)
      setCorrelationStatus('error')
    }
  }

  function stop() {
    if (!LOADING_STATES.includes(correlationStatusRef.current)) {
      return
    }

    window.studio.app.trackEvent({
      event: UsageEventName.AutocorrelationAborted,
      payload: { status: correlationStatusRef.current },
    })
    void stopGeneration()
    setCorrelationStatus('aborted')
    abortControllerRef.current?.abort()
  }

  function reset() {
    setSuggestedRules([])
    setMessages([])
    clearError()
    setCorrelationStatus('not-started')
    setOutcomeReason('')
  }

  function restart() {
    reset()
    return start()
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
    isLoading,
    correlationStatus,
    outcomeReason,
    restart,
    reset,
    stop: useCallback(stop, [stopGeneration]),
  }
}

function toolCallToStep(toolCall: ToolCall): CorrelationStatus {
  const { toolName } = toolCall
  switch (toolName) {
    case 'runValidation':
      return 'validating'
    case 'searchRequests':
    case 'getRequestsMetadata':
    case 'getRequestDetails':
      return 'analyzing'
    case 'addRuleBeginEnd':
    case 'addRuleRegex':
    case 'addRuleJson':
    case 'addRuleHeaderName':
      return 'creating-rules'
    case 'finish':
      return toolCall.input.outcome
    default:
      return exhaustive(toolName)
  }
}

function toCorrelationRule(rule: AiCorrelationRule): CorrelationRule {
  return {
    ...rule,
    id: `autocorrelation_rule_${crypto.randomUUID()}`,
    type: 'correlation',
    enabled: true,
  }
}
