import { useChat } from '@ai-sdk/react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { TokenUsage } from '@/handlers/ai/types'
import { applyRules } from '@/rules/rules'
import { UsageEventName } from '@/services/usageTracking/types'
import { useFeaturesStore } from '@/store/features'
import {
  selectFilteredRequests,
  selectGeneratorData,
  useGeneratorStore,
} from '@/store/generator'
import { AssistantErrorInfo } from '@/types/assistant'
import { AiCorrelationRule } from '@/types/autoCorrelation'
import { AiProvider } from '@/types/features'
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
import { sumTokenUsage } from './utils/sumTokenUsage'
import { validationMatchesRecording } from './utils/validationMatchesRecording'

const outcomeEvents = {
  success: UsageEventName.AutocorrelationSucceeded,
  'partial-success': UsageEventName.AutocorrelationPartiallySucceeded,
  failure: UsageEventName.AutocorrelationFailed,
} as const

export const useGenerateRules = ({
  clearValidation,
}: {
  clearValidation: () => void
}) => {
  const [suggestedRules, setSuggestedRules] = useState<CorrelationRule[]>([])
  const [correlationStatus, setCorrelationStatus] =
    useState<CorrelationStatus>('not-started')
  const [outcomeReason, setOutcomeReason] = useState('')
  const [tokenUsage, setTokenUsage] = useState<TokenUsage>()
  const [assistantErrorInfo, setAssistantErrorInfo] =
    useState<AssistantErrorInfo>()
  const suggestedRulesRef = useRef(suggestedRules)
  const abortControllerRef = useRef<AbortController | null>(null)
  const recording = useGeneratorStore(selectFilteredRequests)
  const generator = useGeneratorStore(selectGeneratorData)

  const isGrafanaAssistant = useFeaturesStore(
    (state) => state.features['grafana-assistant']
  )
  const provider: AiProvider = isGrafanaAssistant
    ? 'grafana-assistant'
    : 'openai'

  suggestedRulesRef.current = suggestedRules

  const {
    sendMessage,
    error,
    addToolOutput,
    status,
    stop: stopGeneration,
    clearError,
    setMessages,
  } = useChat<Message>({
    transport: new IPCChatTransport({
      provider,
      onUsage: (usage) => {
        setTokenUsage((prev) => sumTokenUsage(prev, usage))
      },
      onErrorInfo: (errorInfo) => {
        setAssistantErrorInfo(errorInfo)
      },
    }),

    // Keep calling tools without user input
    sendAutomaticallyWhen: (args) => lastMessageIsToolCall(args, provider),
    onError: (error) => {
      setCorrelationStatus('error')
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

  const isLoading = [
    'validating',
    'analyzing',
    'creating-rules',
    'finalizing',
  ].includes(correlationStatus)

  async function start() {
    window.studio.app.trackEvent({
      event: UsageEventName.AutocorrelationStarted,
    })
    setCorrelationStatus('validating')
    clearError()
    setAssistantErrorInfo(undefined)

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
    void stopGeneration()
    setCorrelationStatus('aborted')
    abortControllerRef.current?.abort()
  }

  function reset() {
    setSuggestedRules([])
    setMessages([])
    clearError()
    setAssistantErrorInfo(undefined)
    setTokenUsage(undefined)
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
    tokenUsage,
    provider,
    assistantErrorInfo,
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
