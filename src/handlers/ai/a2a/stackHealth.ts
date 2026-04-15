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
    log.info(
      LOG_PREFIX,
      `Wake request sent to ${stackUrl}/login, status: ${response.status}`
    )

    // Consume body to release the connection
    await response.text()
  } catch {
    // Wake request is best-effort; health check determines actual status
  }
}

export async function checkStackHealth(
  stackUrl: string
): Promise<StackHealthStatus> {
  const normalizedUrl = stackUrl.endsWith('/')
    ? stackUrl.slice(0, -1)
    : stackUrl

  await wakeStack(normalizedUrl)

  try {
    const response = await fetch(`${normalizedUrl}/api/health`, {
      signal: AbortSignal.timeout(HEALTH_CHECK_TIMEOUT_MS),
    })
    log.info(
      LOG_PREFIX,
      `Health check response from ${normalizedUrl}/api/health, status: ${response.status}`
    )

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
