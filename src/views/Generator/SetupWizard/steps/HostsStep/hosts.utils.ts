import { z } from 'zod'

import { ProxyData } from '@/types'
import { isNonStaticAssetResponse } from '@/utils/staticAssets'

import { HostSuggestion } from '../../state/types'

import { hostSuggestionSchema } from './constants'

const MAX_SAMPLE_PATHS = 5
const MAX_CONTENT_TYPES = 3

export interface HostInventoryEntry {
  host: string
  requestCount: number
  staticAssetCount: number
  contentTypes: string[]
  samplePaths: string[]
}

export type AiHostSuggestion = z.infer<typeof hostSuggestionSchema>

function getContentType(proxyData: ProxyData): string | undefined {
  const header = proxyData.response?.headers.find(
    ([name]) => name.toLowerCase() === 'content-type'
  )

  return header?.[1]?.split(';')[0]?.trim()
}

export function buildHostInventory(
  requests: ProxyData[]
): HostInventoryEntry[] {
  const byHost = requests.reduce<Map<string, HostInventoryEntry>>(
    (inventory, proxyData) => {
      const { request } = proxyData

      if (!request.host) {
        return inventory
      }

      const entry = inventory.get(request.host) ?? {
        host: request.host,
        requestCount: 0,
        staticAssetCount: 0,
        contentTypes: [],
        samplePaths: [],
      }

      entry.requestCount += 1

      if (!isNonStaticAssetResponse(proxyData)) {
        entry.staticAssetCount += 1
      }

      const contentType = getContentType(proxyData)
      if (
        contentType !== undefined &&
        entry.contentTypes.length < MAX_CONTENT_TYPES &&
        !entry.contentTypes.includes(contentType)
      ) {
        entry.contentTypes.push(contentType)
      }

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
      ({ host, requestCount, staticAssetCount, contentTypes, samplePaths }) => {
        const facts = [
          `${requestCount} request${requestCount === 1 ? '' : 's'}`,
          staticAssetCount > 0
            ? `${staticAssetCount} static assets`
            : undefined,
          contentTypes.length > 0
            ? `types: ${contentTypes.join(', ')}`
            : undefined,
        ]
          .filter(Boolean)
          .join('; ')

        return `- ${host} (${facts}): ${samplePaths.join(', ')}`
      }
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
