import { Protocol as CDP } from 'devtools-protocol'
import { z } from 'zod'

const ChromeResultSchema = z.object({
  id: z.number(),
  result: z.record(z.unknown()),
})

const ChromeErrorSchema = z.object({
  id: z.number(),
  error: z.record(z.unknown()),
})

export const ChromeResponseSchema = z.union([
  ChromeResultSchema,
  ChromeErrorSchema,
])

export interface ChromeRequestMap {
  'Extensions.loadUnpacked': {
    request: CDP.Extensions.LoadUnpackedRequest
    response: CDP.Extensions.LoadUnpackedResponse
  }
}

export type ChromeRequest<K extends keyof ChromeRequestMap> = {
  method: K
  params: ChromeRequestMap[K]['request']
}

export type ChromeResponse<K extends keyof ChromeRequestMap> =
  ChromeRequestMap[K]['response']
