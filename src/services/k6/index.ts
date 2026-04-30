import log from 'electron-log/main'
import { z } from 'zod'

import { Stack } from '@/types/auth'
import { timeout } from '@/utils/async'

const PersonalTokenResponseSchema = z.object({
  personal_token: z.string(),
})

interface TokenExchanged {
  type: 'token-exchanged'
  token: string
}

interface NotAMember {
  type: 'not-a-member'
}

export type FetchPersonalTokenRespone = TokenExchanged | NotAMember

const MAX_RETRIES = 5

export async function fetchPersonalToken(
  stack: Stack,
  token: string,
  signal: AbortSignal
): Promise<FetchPersonalTokenRespone> {
  for (let i = 0; i < MAX_RETRIES; ++i) {
    const response = await fetch(`${K6_API_URL}/api_token`, {
      headers: {
        'X-Stack-Id': stack.id,
        Authorization: `Bearer ${token}`,
      },
      signal,
    })

    // It might take a while for the stack to wake up after being paused
    // and the permissions check might timeout, so we retry a few times.
    if (response.status === 503 && stack.status === 'paused') {
      await timeout(1000)

      continue
    }

    if (response.status === 403) {
      return {
        type: 'not-a-member',
      }
    }

    if (response.status !== 200) {
      const body: unknown = await response.json()

      log.error('Failed to fetch personal token', {
        status: response.status,
        statusMessage: response.statusText,
        body,
      })

      throw new Error(
        `Failed to fetch personal token. The server responsed with ${response.status}.`
      )
    }

    const data: unknown = await response.json()
    const parsed = PersonalTokenResponseSchema.parse(data)

    return {
      type: 'token-exchanged',
      token: parsed.personal_token,
    }
  }

  throw new Error(
    `Failed to fetch personal token after ${MAX_RETRIES} retries.`
  )
}
