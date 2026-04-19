import { EventType } from '@rrweb/types'
import { z } from 'zod'

import { BrowserActionEventSchema } from '@/main/runner/schema'
import { LogEntrySchema } from '@/schemas/k6'

export const ValidatorBrowserReplayEventSchema = z
  .object({
    type: z.nativeEnum(EventType),
    timestamp: z.number(),
  })
  .passthrough()

/** Stored on `Recording.log._k6StudioValidatorBrowser` (browser + console). */
export const ValidatorBrowserPersistSchema = z
  .object({
    version: z.enum(['1', '2']),
    actions: z.array(BrowserActionEventSchema),
    replay: z.array(ValidatorBrowserReplayEventSchema),
    logs: z.array(LogEntrySchema).optional(),
  })
  .transform((v) => ({
    version: '2' as const,
    actions: v.actions,
    replay: v.replay,
    logs: v.logs ?? [],
  }))

export type ValidatorBrowserPersist = z.infer<
  typeof ValidatorBrowserPersistSchema
>
