import { StaticToolCall } from 'ai'
import { useRef } from 'react'

import { UsageEventName } from '@/services/usageTracking/types'
import { useGeneratorStore } from '@/store/generator'
import {
  handleRecordingSearchToolCall,
  isRecordingSearchToolCall,
} from '@/utils/assistant/handleRecordingSearchToolCall'
import { useAssistantAgent } from '@/utils/assistant/useAssistantAgent'
import { exhaustive } from '@/utils/typescript'

import { useSetupWizard } from '../../state/SetupWizardContext'
import { HostSuggestion } from '../../state/types'
import { useStepAgentLifecycle } from '../useStepAgentLifecycle'

import {
  hostSelectionTools,
  suggestHostsInputSchema,
  systemPrompt,
} from './constants'
import {
  buildHostInventory,
  formatHostInventory,
  HostInventoryEntry,
  mergeHostSuggestions,
} from './hosts.utils'

type HostsToolCall = StaticToolCall<typeof hostSelectionTools>

function buildSummary(suggestions: HostSuggestion[]): string {
  const included = suggestions.filter((suggestion) => suggestion.suggested)

  return `Recommended ${included.length} of ${suggestions.length} hosts for the load test`
}

export function useHostsAgent() {
  const { dispatch } = useSetupWizard()
  // The allowlist is still empty at this point, so read the unfiltered
  // requests rather than selectFilteredRequests.
  const requests = useGeneratorStore((store) => store.requests)
  const setAllowlist = useGeneratorStore((store) => store.setAllowlist)

  const inventoryRef = useRef<HostInventoryEntry[]>([])
  const suggestionsRef = useRef<HostSuggestion[]>([])

  const agent = useAssistantAgent({
    tools: hostSelectionTools,
    trackingEvents: {
      started: { event: UsageEventName.HostSelectionStarted },
      errored: { event: UsageEventName.HostSelectionErrored },
      aborted: { event: UsageEventName.HostSelectionAborted },
    },
    onToolCall: handleToolCall,
  })

  const { actionsLog, status } = agent

  function handleToolCall(toolCall: HostsToolCall): unknown {
    if (isRecordingSearchToolCall(toolCall)) {
      return handleRecordingSearchToolCall(
        toolCall,
        requests,
        actionsLog.addEntry
      )
    }

    switch (toolCall.toolName) {
      case 'suggestHosts': {
        const { hosts } = suggestHostsInputSchema.parse(toolCall.input)
        suggestionsRef.current = mergeHostSuggestions(
          inventoryRef.current,
          hosts
        )
        actionsLog.addEntry({
          type: 'found',
          text: `Classified **${suggestionsRef.current.length} hosts**`,
        })
        return { classifiedHosts: suggestionsRef.current.length }
      }

      case 'finish': {
        const isSuccess =
          toolCall.input.outcome === 'success' &&
          suggestionsRef.current.length > 0

        window.studio.app.trackEvent({
          event: isSuccess
            ? UsageEventName.HostSelectionSucceeded
            : UsageEventName.HostSelectionFailed,
        })
        actionsLog.markLastReasoningAsOutcome(
          isSuccess ? 'outcome-success' : 'outcome-failure'
        )
        return toolCall.input.outcome
      }

      default:
        return exhaustive(toolCall)
    }
  }

  const dispatchCompletion = () => {
    const suggestions = suggestionsRef.current

    if (suggestions.length === 0) {
      dispatch({
        type: 'stepRunFailed',
        stepId: 'hosts',
        message: 'The Assistant did not classify any hosts.',
      })
      return
    }

    setAllowlist(
      suggestions
        .filter((suggestion) => suggestion.suggested)
        .map((suggestion) => suggestion.host)
    )
    dispatch({
      type: 'stepRunCompleted',
      stepId: 'hosts',
      result: { step: 'hosts', suggestions },
      log: actionsLog.entries,
      summary: buildSummary(suggestions),
    })
  }

  useStepAgentLifecycle({
    stepId: 'hosts',
    status,
    onCompleted: dispatchCompletion,
    failureMessage: 'The Assistant run failed. Try again.',
  })

  function start() {
    const inventory = buildHostInventory(requests)
    inventoryRef.current = inventory
    suggestionsRef.current = []

    dispatch({ type: 'stepRunStarted', stepId: 'hosts' })
    actionsLog.addEntry({
      type: 'info',
      text: `Reading **${requests.length} requests** across **${inventory.length} hosts**`,
    })

    void agent.start(
      `${systemPrompt}\n\nHost inventory:\n${formatHostInventory(inventory)}`
    )
  }

  function restart() {
    agent.reset()
    start()
  }

  return {
    start,
    restart,
    stop: agent.stop,
    status: agent.status,
    error: agent.error,
    logEntries: actionsLog.entries,
  }
}
