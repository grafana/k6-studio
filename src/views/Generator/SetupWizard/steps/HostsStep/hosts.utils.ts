import { z } from 'zod'

import { ProxyData } from '@/types'

import { HostSuggestion } from '../../state/types'

import { hostSuggestionSchema } from './constants'

const MAX_SAMPLE_PATHS = 5

export interface HostInventoryEntry {
  host: string
  requestCount: number
  samplePaths: string[]
}

export type AiHostSuggestion = z.infer<typeof hostSuggestionSchema>

export function buildHostInventory(
  requests: ProxyData[]
): HostInventoryEntry[] {
  const byHost = requests.reduce<Map<string, HostInventoryEntry>>(
    (inventory, { request }) => {
      if (!request.host) {
        return inventory
      }

      const entry = inventory.get(request.host) ?? {
        host: request.host,
        requestCount: 0,
        samplePaths: [],
      }

      entry.requestCount += 1

      if (
        entry.samplePaths.length < MAX_SAMPLE_PATHS &&
        !entry.samplePaths.includes(request.path)
      ) {
        entry.samplePaths.push(request.path)
      }

      return inventory.set(request.host, entry)
    },
    new Map()
  )

  return [...byHost.values()]
}

export function formatHostInventory(inventory: HostInventoryEntry[]): string {
  return inventory
    .map(
      ({ host, requestCount, samplePaths }) =>
        `- ${host} (${requestCount} request${requestCount === 1 ? '' : 's'}): ${samplePaths.join(', ')}`
    )
    .join('\n')
}

/**
 * Joins the agent's suggestions with the client-side inventory. Hosts the
 * agent omitted are kept (excluded by default) and invented hosts dropped, so
 * the result always covers exactly the hosts in the recording.
 */
export function mergeHostSuggestions(
  inventory: HostInventoryEntry[],
  suggestions: AiHostSuggestion[]
): HostSuggestion[] {
  const byHost = new Map(
    suggestions.map((suggestion) => [suggestion.host, suggestion])
  )

  return inventory.map(({ host, requestCount }) => {
    const suggestion = byHost.get(host)

    if (!suggestion) {
      return {
        host,
        category: 'other',
        suggested: false,
        reason: 'Not classified by the Assistant.',
        requestCount,
      }
    }

    return {
      host,
      category: suggestion.category,
      suggested: suggestion.include,
      reason: suggestion.reason,
      requestCount,
    }
  })
}
