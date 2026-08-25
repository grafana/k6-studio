import log from 'electron-log/main'
import { z } from 'zod'

import { parseJsonAsSchema } from '@/utils/json'

import { LOG_PREFIX } from './constants'

export type StackHealthStatus = 'ready' | 'loading'

export type StackWakeResult =
  | { status: 'awake' }
  | { status: 'loading' }
  | { status: 'captcha-required'; url: string }

const HealthResponseSchema = z.object({
  database: z.string(),
})

/** Error the Grafana Cloud gateway returns for an instance it won't serve yet. */
const GatewayErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
})

const HIBERNATING_CODE = 'Loading'

/** An instance booting on its own sends the same code, so match the message. */
const CAPTCHA_MESSAGE = 'Click on the checkbox'

const HEALTH_CHECK_TIMEOUT_MS = 5000

/**
 * Sends a request to the login page to wake a hibernating Grafana Cloud stack.
 * The /api/health endpoint does not wake hibernating stacks on its own.
 * See: https://github.com/grafana/terraform-provider-grafana/blob/6d9acfb3939ef17e5cff4f144ff91ecec88c2d97/internal/resources/cloud/resource_cloud_stack.go#L704-L705
 *
 * Keep this one-shot. The gateway rate limits wake attempts per client IP and
 * forces its captcha once tripped. Poll checkStackHealth instead, it's exempt.
 */
export async function wakeStack(stackUrl: string): Promise<StackWakeResult> {
  try {
    const response = await fetch(`${stackUrl}/login?disableAutoLogin=true`, {
      // Get the gateway's JSON error, not its captcha page
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(HEALTH_CHECK_TIMEOUT_MS),
    })

    // Consume body to release the connection
    const body = await response.text()

    if (response.ok) {
      return { status: 'awake' }
    }

    if (needsCaptcha(body)) {
      return { status: 'captcha-required', url: stackUrl }
    }

    return { status: 'loading' }
  } catch (error) {
    log.debug(LOG_PREFIX, 'Wake request failed:', error)
    return { status: 'loading' }
  }
}

function needsCaptcha(body: string): boolean {
  const parsed = parseJsonAsSchema(body, GatewayErrorSchema)

  return (
    parsed.success &&
    parsed.data.code === HIBERNATING_CODE &&
    parsed.data.message.includes(CAPTCHA_MESSAGE)
  )
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
