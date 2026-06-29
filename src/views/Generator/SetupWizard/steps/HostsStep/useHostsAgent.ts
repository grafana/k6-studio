import { StaticToolCall } from 'ai'
import { useRef } from 'react'

import { UsageEventName } from '@/services/usageTracking/types'
import { useGeneratorStore } from '@/store/generator'
import { groupHostsByParty } from '@/store/generator/slices/recording.utils'
import { exhaustive } from '@/utils/typescript'

import { useSetupWizard } from '../../state/SetupWizardContext'
import { HostSuggestion } from '../../state/types'
import { useStepAgent } from '../useStepAgent'

import {
  hostSelectionTools,
  suggestHostsInputSchema,
  systemPrompt,
} from './constants'
import {
  buildHostInventory,
  buildSkippedHostSuggestions,
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

  const agent = useStepAgent({
    stepId: 'hosts',
    tools: hostSelectionTools,
    // The full host inventory is in the prompt, so the agent classifies in a
    // single suggestHosts call that also ends the run.
    terminalTool: 'suggestHosts',
    trackingEvents: {
      started: { event: UsageEventName.HostSelectionStarted },
      errored: { event: UsageEventName.HostSelectionErrored },
      aborted: { event: UsageEventName.HostSelectionAborted },
    },
    onToolCall: handleToolCall,
    onCompleted: dispatchCompletion,
    beginRun: (run) => {
      const inventory = buildHostInventory(requests)
      inventoryRef.current = inventory
      suggestionsRef.current = []

      void run.start(
        `${systemPrompt}\n\nHost inventory:\n${formatHostInventory(inventory)}`
      )
      run.actionsLog.addEntry({
        type: 'info',
        text: `Reading **${requests.length} requests** across **${inventory.length} hosts**`,
      })
    },
    // Skipping mirrors the host selection dialog's default: select only the
    // first first-party host and leave the rest unclassified.
    skip: () => {
      const inventory = buildHostInventory(requests)
      const { firstParty } = groupHostsByParty(
        inventory.map((entry) => entry.host)
      )
      const selectedHost = firstParty[0]
      const suggestions = buildSkippedHostSuggestions(inventory, selectedHost)
      suggestionsRef.current = suggestions
      setAllowlist(selectedHost !== undefined ? [selectedHost] : [])

      return {
        result: { step: 'hosts', suggestions },
        summary: 'Step skipped - review the selected hosts',
      }
    },
  })

  function handleToolCall(toolCall: HostsToolCall): unknown {
    switch (toolCall.toolName) {
      case 'suggestHosts': {
        const { hosts } = suggestHostsInputSchema.parse(toolCall.input)
        suggestionsRef.current = mergeHostSuggestions(
          inventoryRef.current,
          hosts
        )
        const isSuccess = suggestionsRef.current.length > 0

        window.studio.app.trackEvent({
          event: isSuccess
            ? UsageEventName.HostSelectionSucceeded
            : UsageEventName.HostSelectionFailed,
        })
        agent.actionsLog.addEntry({
          type: 'found',
          text: `Classified **${suggestionsRef.current.length} hosts**`,
        })
        agent.actionsLog.markLastReasoningAsOutcome(
          isSuccess ? 'outcome-success' : 'outcome-failure'
        )
        return { classifiedHosts: suggestionsRef.current.length }
      }

      default:
        return exhaustive(toolCall.toolName)
    }
  }

  function dispatchCompletion() {
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
      log: agent.actionsLog.entries,
      summary: buildSummary(suggestions),
    })
  }

  return agent
}
