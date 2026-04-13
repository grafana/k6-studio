import log from 'electron-log/main'
import { z } from 'zod'

import { LOG_PREFIX } from './constants'

export type StackHealthStatus = 'ready' | 'loading'

const HealthResponseSchema = z.object({
  database: z.string(),
})

const HEALTH_CHECK_TIMEOUT_MS = 5000

export async function checkStackHealth(
  stackUrl: string
): Promise<StackHealthStatus> {
  const normalizedUrl = stackUrl.endsWith('/')
    ? stackUrl.slice(0, -1)
    : stackUrl

  try {
    const response = await fetch(`${normalizedUrl}/api/health`, {
      signal: AbortSignal.timeout(HEALTH_CHECK_TIMEOUT_MS),
    })
    log.info('response', response)

    if (!response.ok) {
      return 'loading'
    }

    const body = HealthResponseSchema.parse(await response.json())
    log.info('body', body)

    if (body.database !== 'ok') {
      return 'loading'
    }

    return 'ready'
  } catch (error) {
    log.debug(LOG_PREFIX, 'Stack health check failed:', error)
    return 'loading'
  }
}
