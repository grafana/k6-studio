import type { RawData } from 'ws'
import { z } from 'zod'

export const EnvelopeSchema = z.looseObject({
  data: z
    .looseObject({
      type: z.string(),
      events: z
        .array(
          z.object({
            type: z.string(),
            target: z
              .object({ selectors: z.object({ css: z.string() }) })
              .optional(),
            frames: z
              .array(z.object({ selectors: z.object({ css: z.string() }) }))
              .optional(),
          })
        )
        .optional(),
    })
    .optional(),
})

export function decodeMessage(data: RawData): string {
  if (Array.isArray(data)) return Buffer.concat(data).toString()
  if (data instanceof ArrayBuffer) return Buffer.from(data).toString()
  return data.toString()
}
