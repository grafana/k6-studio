import { z } from 'zod'
import log from 'electron-log/main'

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

export async function fetchPersonalToken(
  stackId: string,
  token: string,
  signal: AbortSignal
): Promise<FetchPersonalTokenRespone> {
  const response = await fetch(`${K6_API_URL}/api_token`, {
    headers: {
      'X-Stack-Id': stackId,
      Authorization: `Bearer ${token}`,
    },
    signal,
  })

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
