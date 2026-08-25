import log from 'electron-log/main'
import { z } from 'zod'

import { LOG_PREFIX } from './constants'

export type StackHealthStatus = 'ready' | 'loading'

export type StackWakeResult =
  | { status: 'awake' }
  | { status: 'loading' }
  | { status: 'captcha-required'; url: string }

const HealthResponseSchema = z.object({
  database: z.string(),
})

/**
 * Grafana Cloud's gateway rejects requests to a hibernating instance with this
 * payload. A browser gets the same status as an HTML page holding a reCAPTCHA
 * checkbox, and the instance only boots once someone clicks it, so we point the
 * user at their instance instead of polling forever.
 */
const GatewayErrorSchema = z.object({
  code: z.string(),
})

const HIBERNATING_CODE = 'Loading'

const HEALTH_CHECK_TIMEOUT_MS = 5000

/**
 * Sends a request to the login page to wake a hibernating Grafana Cloud stack.
 * The /api/health endpoint does not wake hibernating stacks on its own.
 * See: https://github.com/grafana/terraform-provider-grafana/blob/6d9acfb3939ef17e5cff4f144ff91ecec88c2d97/internal/resources/cloud/resource_cloud_stack.go#L704-L705
 */
export async function wakeStack(stackUrl: string): Promise<StackWakeResult> {
  try {
    const response = await fetch(`${stackUrl}/login?disableAutoLogin=true`, {
      // Ask for the gateway's JSON error instead of its captcha page
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(HEALTH_CHECK_TIMEOUT_MS),
    })

    // Consume body to release the connection
    const body = await response.text()

    if (response.ok) {
      return { status: 'awake' }
    }

    if (isHibernating(body)) {
      return { status: 'captcha-required', url: stackUrl }
    }

    return { status: 'loading' }
  } catch (error) {
    log.debug(LOG_PREFIX, 'Wake request failed:', error)
    return { status: 'loading' }
  }
}

function isHibernating(body: string): boolean {
  try {
    const { code } = GatewayErrorSchema.parse(JSON.parse(body))

    return code === HIBERNATING_CODE
  } catch {
    return false
  }
}

export async function checkStackHealth(
  stackUrl: string
): Promise<StackHealthStatus> {
  try {
    const response = await fetch(`${stackUrl}/api/health`, {
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
