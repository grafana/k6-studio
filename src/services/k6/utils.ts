import { z } from 'zod'

import { getUserAgent } from '@/utils/cloud'

import { CloudCredentials } from './types'

export function url(path: `/${string}`) {
  return `${K6_API_URL}${path}`
}

export function getHeaders({ stackId, token }: CloudCredentials) {
  return {
    'X-Stack-Id': stackId,
    Authorization: `Bearer ${token}`,
    'User-Agent': getUserAgent(),
  }
}

export async function parse<Output = unknown, Input = Output>(
  response: Response,
  schema: z.ZodType<Output, Input>
) {
  const data: unknown = await response.json()

  return schema.parse(data)
}
