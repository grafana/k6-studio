import { useChat } from '@ai-sdk/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { z } from 'zod'

import { useActionsLog } from '@/components/Assistant/useActionsLog'
import { UsageEventName } from '@/services/usageTracking/types'
import {
  selectFilteredRequests,
  selectGeneratorData,
  useGeneratorStore,
} from '@/store/generator'
import { createTerminalToolGuard } from '@/utils/assistant/chat'
import { IPCChatTransport } from '@/utils/assistant/IPCChatTransport'
import {
  getRequestDetails,
  getRequestsMetadata,
  searchRequests,
} from '@/utils/assistant/searchToolHandlers'
import { prepareRequestsForAI } from '@/utils/assistant/stripRequestData'
import { serializeToolDefinitions } from '@/utils/assistant/tools'
import { exhaustive } from '@/utils/typescript'
import { validateScript } from '@/utils/validateScript'

import { generateScriptPreview } from '../Generator.utils'

import { systemPrompt, tools } from './constants'
import type {
  CorrelationStatus,
  Message,
  SuggestedRuleEntry,
  ToolCall,
} from './types'
import { computeAddRuleResult } from './utils/computeAddRuleResult'
import { parseAiCorrelationRule } from './utils/parseAiCorrelationRule'
import { summarizeValidationForAI } from './utils/summarizeValidationForAI'
import { validationMatchesRecording } from './utils/validationMatchesRecording'

// The finish tool's input arrives unvalidated (tool definitions are plain
// JSON schemas with no validator), so the outcome must be re-parsed before it
// becomes the correlation status or a usage-event key.
const finishInputSchema = z.object({
  outcome: z.enum(['success', 'partial-success', 'failure']),
})

const outcomeEvents = {
  success: UsageEventName.AutocorrelationSucceeded,
  'partial-success': UsageEventName.AutocorrelationPartiallySucceeded,
  failure: UsageEventName.AutocorrelationFailed,
} as const

// How many consecutive tool-handler failures round-trip to the model before
// the run gives up and surfaces the error state.
const MAX_CONSECUTIVE_TOOL_FAILURES = 3

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
  const consecutiveToolFailuresRef = useRef(0)

  const recording = useGeneratorStore(selectFilteredRequests)
  const generator = useGeneratorStore(selectGeneratorData)
  const transport = useMemo(
    () => new IPCChatTransport({ tools: serializeToolDefinitions(tools) }),
    []
  )
  const finishGuard = useMemo(() => createTerminalToolGuard('finish'), [])
  const actionsLog = useActionsLog()

  function setRuleEntriesAndRef(
    updater:
      | SuggestedRuleEntry[]
      | ((prev: SuggestedRuleEntry[]) => SuggestedRuleEntry[])
  ) {
    setRuleEntries(updater)
  }

  // Sync refs after commit (not during render) so aborted renders in
  // concurrent mode can't leave refs pointing at uncommitted state.
  useEffect(() => {
    ruleEntriesRef.current = ruleEntries
  })

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

      // A handler failure (e.g. the model sent malformed tool input) is
      // returned as the tool output so the model can retry, but only a few
      // times: persistent failures (proxy died, k6 gone) would otherwise loop
      // "Correlating..." forever. Past the cap the rejection propagates to the
      // AI SDK, which routes it to onError and the error/retry UI.
      let toolResult: unknown
      try {
        toolResult = await handleToolCall(toolCallWithType)
        consecutiveToolFailuresRef.current = 0
      } catch (toolError) {
        console.error(toolError)
        consecutiveToolFailuresRef.current += 1

        if (
          consecutiveToolFailuresRef.current >= MAX_CONSECUTIVE_TOOL_FAILURES
        ) {
          throw toolError
        }

        toolResult = {
          error:
            toolError instanceof Error
              ? toolError.message
              : 'Tool execution failed',
        }
      }

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
        // Throws on an off-enum outcome; the wrapper returns the error to the
        // model so it can retry with a valid one.
        const { outcome } = finishInputSchema.parse(toolCall.input)
        window.studio.app.trackEvent({
          event: outcomeEvents[outcome],
        })
        const outcomeType =
          outcome === 'failure'
            ? 'outcome-failure'
            : outcome === 'partial-success'
              ? 'outcome-partial'
              : 'outcome-success'
        actionsLog.markLastReasoningAsOutcome(outcomeType)
        return outcome
      }

      default:
        return exhaustive(toolName)
    }
  }

  function addRule(ruleInput: unknown) {
    // Tool input arrives unvalidated (buildToolSet uses jsonSchema with no
    // validator), so re-parse to apply schema defaults and surface a malformed
    // rule as a retryable tool error rather than throwing downstream.
    const parsed = parseAiCorrelationRule(ruleInput)
    if (!parsed.ok) {
      return parsed.error
    }

    const currentRules = ruleEntriesRef.current.map((entry) => entry.rule)
    const result = computeAddRuleResult(parsed.rule, currentRules, recording)

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

    const comparison = validationMatchesRecording(
      prepareRequestsForAI(recording),
      prepareRequestsForAI(validationResult)
    )

    return summarizeValidationForAI(comparison)
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
      const validationSummary = await runValidation()
      actionsLog.completeValidationProgress()

      if (validationSummary.success) {
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

      return await sendMessage({
        text: `${systemPrompt} \n\n Validation result: ${JSON.stringify(validationSummary)}`,
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
    case 'finish': {
      // An off-enum outcome must not become the status; stay on the
      // 'finalizing' loading state while the error round-trips to the model.
      const parsed = finishInputSchema.safeParse(toolCall.input)
      return parsed.success ? parsed.data.outcome : 'finalizing'
    }
    default:
      return exhaustive(toolName)
  }
}
