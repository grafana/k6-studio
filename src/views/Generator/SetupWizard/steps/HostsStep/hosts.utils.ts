import { z } from 'zod'

import { ProxyData } from '@/types'

import { HostSuggestion } from '../../state/types'

import { hostSuggestionSchema } from './constants'

const MAX_SAMPLE_PATHS = 5
const MAX_SAMPLE_PATH_LENGTH = 80

// Query strings and very long paths inflate the prompt (and time to first
// token) without helping classification.
function toSamplePath(path: string): string {
  const withoutQuery = path.split('?')[0] ?? path

  return withoutQuery.slice(0, MAX_SAMPLE_PATH_LENGTH)
}

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

      const samplePath = toSamplePath(request.path)

      if (
        entry.samplePaths.length < MAX_SAMPLE_PATHS &&
        !entry.samplePaths.includes(samplePath)
      ) {
        entry.samplePaths.push(samplePath)
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
 * the result always covers exactly the hosts in the recording. Suggested
 * hosts sort first.
 */
export function mergeHostSuggestions(
  inventory: HostInventoryEntry[],
  suggestions: AiHostSuggestion[]
): HostSuggestion[] {
  const byHost = new Map(
    suggestions.map((suggestion) => [suggestion.host, suggestion])
  )

  return inventory
    .map(({ host, requestCount }): HostSuggestion => {
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
    .sort((left, right) => Number(right.suggested) - Number(left.suggested))
}
