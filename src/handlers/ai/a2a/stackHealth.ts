import log from 'electron-log/main'
import { z } from 'zod'

import { LOG_PREFIX } from './constants'

export type StackHealthStatus = 'ready' | 'loading'

const HealthResponseSchema = z.object({
  database: z.string(),
})

const HEALTH_CHECK_TIMEOUT_MS = 5000

/**
 * Sends a request to the login page to wake a hibernating Grafana Cloud stack.
 * The /api/health endpoint does not wake hibernating stacks on its own.
 * See: https://github.com/grafana/terraform-provider-grafana/blob/6d9acfb3939ef17e5cff4f144ff91ecec88c2d97/internal/resources/cloud/resource_cloud_stack.go#L704-L705
 */
async function wakeStack(stackUrl: string): Promise<void> {
  try {
    const response = await fetch(`${stackUrl}/login?disableAutoLogin=true`, {
      signal: AbortSignal.timeout(HEALTH_CHECK_TIMEOUT_MS),
    })

    // Consume body to release the connection
    await response.text()
  } catch (error) {
    log.debug(LOG_PREFIX, 'Wake request failed:', error)
  }
}

export async function checkStackHealth(
  stackUrl: string
): Promise<StackHealthStatus> {
  const normalizedUrl = stackUrl.endsWith('/')
    ? stackUrl.slice(0, -1)
    : stackUrl

  // Fire-and-forget: wake is best-effort, no need to block the health check
  void wakeStack(normalizedUrl)

  try {
    const response = await fetch(`${normalizedUrl}/api/health`, {
      signal: AbortSignal.timeout(HEALTH_CHECK_TIMEOUT_MS),
    })

    if (!response.ok) {
      return 'loading'
    }

    const body = HealthResponseSchema.parse(await response.json())

    if (body.database !== 'ok') {
      return 'loading'
    }

    return 'ready'
  } catch (error) {
    log.debug(LOG_PREFIX, 'Stack health check failed:', error)
    return 'loading'
  }
}
