import { z } from 'zod'

const ChromeEventSchema = z.object({
  sessionId: z.string().optional(),
  method: z.string(),
  params: z.unknown(),
})

const ChromeResultSchema = z.object({
  id: z.number(),
  result: z.record(z.unknown()),
})

const ChromeErrorSchema = z.object({
  id: z.number(),
  error: z.record(z.unknown()),
})

export const ChromeResponseSchema = z.union([
  ChromeEventSchema,
  ChromeResultSchema,
  ChromeErrorSchema,
])

export type ChromeResult = z.infer<typeof ChromeResultSchema>
export type ChromeError = z.infer<typeof ChromeErrorSchema>

export type ChromeCallResult = ChromeResult | ChromeError
