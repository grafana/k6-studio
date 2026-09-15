import { z } from 'zod'

import { ProxyData } from '@/types'
import { getContentType } from '@/utils/headers'
import { isNonStaticAssetResponse } from '@/utils/staticAssets'

import { HostSuggestion } from '../../state/types'

import { hostSuggestionSchema } from './constants'

const MAX_SAMPLE_PATHS = 5
const MAX_CONTENT_TYPES = 3
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
  staticAssetCount: number
  contentTypes: string[]
  samplePaths: string[]
}

export type AiHostSuggestion = z.infer<typeof hostSuggestionSchema>

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

      const contentType = getContentType(
        proxyData.response?.headers ?? []
      )?.trim()
      if (
        contentType !== undefined &&
        entry.contentTypes.length < MAX_CONTENT_TYPES &&
        !entry.contentTypes.includes(contentType)
      ) {
        entry.contentTypes.push(contentType)
      }

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
 * Skipping the step mirrors the host selection dialog's default: only the
 * first first-party host is selected, nothing is classified.
 */
export function buildSkippedHostSuggestions(
  inventory: HostInventoryEntry[],
  selectedHost: string | undefined
): HostSuggestion[] {
  return inventory
    .map(
      ({ host, requestCount }): HostSuggestion => ({
        host,
        category: 'other',
        suggested: false,
        reason: 'Not classified because the step was skipped.',
        requestCount,
      })
    )
    .sort(
      (left, right) =>
        Number(right.host === selectedHost) - Number(left.host === selectedHost)
    )
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
