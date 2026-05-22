import { useChat } from '@ai-sdk/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { UsageEventName } from '@/services/usageTracking/types'
import {
  selectFilteredRequests,
  selectGeneratorData,
  useGeneratorStore,
} from '@/store/generator'
import type { AiCorrelationRule } from '@/types/autoCorrelation'
import { createTerminalToolGuard } from '@/utils/assistant/chat'
import { exhaustive } from '@/utils/typescript'
import { validateScript } from '@/utils/validateScript'

import { generateScriptPreview } from '../Generator.utils'

import { systemPrompt } from './constants'
import type {
  CorrelationStatus,
  Message,
  SuggestedRuleEntry,
  ToolCall,
} from './types'
import { useActionsLog } from './useActionsLog'
import { IPCChatTransport } from './utils/IPCChatTransport'
import { computeAddRuleResult } from './utils/computeAddRuleResult'
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
  const [ruleEntries, setRuleEntries] = useState<SuggestedRuleEntry[]>([])
  const [correlationStatus, setCorrelationStatus] =
    useState<CorrelationStatus>('not-started')

  const ruleEntriesRef = useRef(ruleEntries)
  const correlationStatusRef = useRef(correlationStatus)
  const abortControllerRef = useRef<AbortController | null>(null)

  const recording = useGeneratorStore(selectFilteredRequests)
  const generator = useGeneratorStore(selectGeneratorData)
  const transport = useMemo(() => new IPCChatTransport(), [])
  const finishGuard = useMemo(() => createTerminalToolGuard('finish'), [])
  const actionsLog = useActionsLog()

  function setRuleEntriesAndRef(
    updater:
      | SuggestedRuleEntry[]
      | ((prev: SuggestedRuleEntry[]) => SuggestedRuleEntry[])
  ) {
    setRuleEntries((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      ruleEntriesRef.current = next
      return next
    })
  }

  function setCorrelationStatusAndRef(status: CorrelationStatus) {
    correlationStatusRef.current = status
    setCorrelationStatus(status)
  }

  const {
    sendMessage,
    error,
    messages,
    addToolOutput,
    status,
    stop: stopGeneration,
    clearError,
    setMessages,
  } = useChat<Message>({
    transport,
    sendAutomaticallyWhen: finishGuard.guard,
    onError: (error) => {
      setCorrelationStatusAndRef('error')
      window.studio.app.trackEvent({
        event: UsageEventName.AutocorrelationErrored,
      })
      console.error(error)
    },
    onToolCall: async ({ toolCall }) => {
      if (toolCall.dynamic) {
        return
      }

      const toolCallWithType = {
        ...toolCall,
        type: 'tool-call' as const,
      }

      setCorrelationStatusAndRef(toolCallToStep(toolCallWithType))
      const toolResult = await handleToolCall(toolCallWithType)

      void addToolOutput({
        tool: toolCall.toolName,
        toolCallId: toolCall.toolCallId,
        output: toolResult,
      })
    },
  })

  const syncMessagesToLog = actionsLog.syncFromMessages

  useEffect(() => {
    syncMessagesToLog(
      messages,
      LOADING_STATES.includes(correlationStatusRef.current)
    )
  }, [messages, syncMessagesToLog])

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
        actionsLog.addEntry({
          type: 'info',
          text: `Searching requests for "${query}"`,
        })
        return searchRequests(recording, query, limit ?? 20)
      }

      case 'getRequestsMetadata': {
        const { startIndex, endIndex } = toolCall.input
        actionsLog.addEntry({
          type: 'info',
          text: 'Reading request metadata',
        })
        return getRequestsMetadata(recording, startIndex ?? 0, endIndex)
      }

      case 'getRequestDetails': {
        const { requestIds, fields } = toolCall.input
        actionsLog.addEntry({
          type: 'info',
          text: `Inspecting ${requestIds.length} request${requestIds.length > 1 ? 's' : ''} (${fields?.join(', ') ?? 'all fields'})`,
        })
        return getRequestDetails(recording, requestIds, fields)
      }

      case 'runValidation': {
        const entry = actionsLog.addEntry({
          type: 'validation',
        })

        actionsLog.setValidationEntryId(entry.id)
        const result = await runValidation()
        actionsLog.completeValidationProgress()
        return result
      }

      case 'finish': {
        window.studio.app.trackEvent({
          event: outcomeEvents[toolCall.input.outcome],
        })
        actionsLog.markLastReasoningAsOutcome(
          toolCall.input.outcome === 'failure'
            ? 'outcome-failure'
            : 'outcome-success'
        )
        return toolCall.input.outcome
      }

      default:
        return exhaustive(toolName)
    }
  }

  function addRule(rule: AiCorrelationRule) {
    const currentRules = ruleEntriesRef.current.map((entry) => entry.rule)
    const result = computeAddRuleResult(rule, currentRules, recording)

    if (!result.ok) return result.reason

    setRuleEntriesAndRef((prev) => [
      ...prev,
      { rule: result.rule, correlationState: result.correlationState },
    ])

    actionsLog.addEntry({
      type: 'found',
      text: `Adding rule to extract ${result.variableName}`,
      ruleId: result.rule.id,
    })

    return result.matchedRequestIds
  }

  async function runValidation() {
    clearValidation()
    const currentRules = ruleEntriesRef.current.map((entry) => entry.rule)
    const scriptPath = await window.studio.fs.getTempScriptPath()

    const script = await generateScriptPreview(
      scriptPath,
      {
        ...generator,
        rules: [...generator.rules, ...currentRules],
      },
      recording
    )

    const validationResult = await validateScript(
      script,
      scriptPath,
      abortControllerRef.current?.signal,
      false
    )

    return validationMatchesRecording(
      prepareRequestsForAI(recording),
      prepareRequestsForAI(validationResult)
    )
  }

  const removeRule = useCallback((ruleId: string) => {
    setRuleEntriesAndRef((prev) =>
      prev.filter((entry) => entry.rule.id !== ruleId)
    )
  }, [])

  const isLoading = LOADING_STATES.includes(correlationStatus)

  async function start() {
    window.studio.app.trackEvent({
      event: UsageEventName.AutocorrelationStarted,
    })
    actionsLog.startTimer()
    setCorrelationStatusAndRef('validating')
    clearError()

    const initialEntry = actionsLog.addEntry({
      type: 'validation',
      text: `Validating ${recording.length} requests`,
    })
    actionsLog.setValidationEntryId(initialEntry.id)

    try {
      const validationResult = await runValidation()
      actionsLog.completeValidationProgress()

      if (validationResult.success) {
        setCorrelationStatusAndRef('correlation-not-needed')
        actionsLog.addEntry({
          type: 'info',
          text: 'Validation passed. No additional correlation rules are needed.',
        })
        return
      }

      setCorrelationStatusAndRef('analyzing')
      actionsLog.addEntry({
        type: 'info',
        text: 'Initial validation found mismatches, starting analysis',
      })

      return sendMessage({
        text: `${systemPrompt} \n\n Validation result: ${JSON.stringify(validationResult)}`,
      })
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }
      console.error(error)
      setCorrelationStatusAndRef('error')
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
    setCorrelationStatusAndRef('aborted')
    abortControllerRef.current?.abort()
  }

  function reset() {
    setRuleEntriesAndRef([])
    setMessages([])
    clearError()
    setCorrelationStatusAndRef('not-started')
    actionsLog.reset()
    finishGuard.reset()
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
    ruleEntries,
    actionsLog: actionsLog.entries,
    isLoading,
    correlationStatus,
    removeRule,
    updateValidationProgress: actionsLog.updateValidationProgress,
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
