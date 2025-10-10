import type { Page } from 'har-format'
import { z } from 'zod'

import { EntryWithOptionalResponse } from '@/types/har'

import type { Recording as RecordingV2 } from '../v2/recording'

import { BrowserEventSchema } from './browser'

export const RecordingSchema = z.object({
  log: z.object({
    version: z.literal('1.2'),
    creator: z.object({
      name: z.literal('k6-studio'),
      version: z.string(),
    }),
    pages: z.unknown().transform((value) => value as Page[]),
    entries: z
      .unknown()
      .transform((value) => value as EntryWithOptionalResponse[]),
    _browserEvents: BrowserEventSchema.array().optional(),
  }),
})

export type Recording = z.infer<typeof RecordingSchema>

export function migrate(recording: Recording): RecordingV2 {
  return {
    ...recording,
    log: {
      ...recording.log,
      _browserEvents: {
        version: '2',
        events: recording.log._browserEvents ?? [],
      },
    },
  }
}
