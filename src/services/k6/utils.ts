import { z } from 'zod'

import { CloudCredentials } from './types'

export function url(path: `/${string}`) {
  return `${K6_API_URL}${path}`
}

export function getHeaders({ stackId, token }: CloudCredentials) {
  return {
    'X-Stack-Id': stackId,
    Authorization: `Bearer ${token}`,
  }
}

export async function parse<
  Output = unknown,
  Def extends z.ZodTypeDef = z.ZodTypeDef,
  Input = Output,
>(response: Response, schema: z.ZodSchema<Output, Def, Input>) {
  const data: unknown = await response.json()

  return schema.parse(data)
}
