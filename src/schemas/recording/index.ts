import type { Page } from 'har-format'
import { z } from 'zod'

import { EntryWithOptionalResponse } from '@/types/har'

import * as v1 from './browser/v1'
import * as v2 from './browser/v2'

export * from './browser/v2'

// Schema for any version stored on disk
const AnyBrowserEventsSchema = z.union([
  v1.BrowserEventsSchema,
  z.discriminatedUnion('version', [v2.BrowserEventsSchema]),
])

function migrate(browserEvents: z.infer<typeof AnyBrowserEventsSchema>) {
  // pre-v2 browser events do not have a version field
  if ('version' in browserEvents === false) {
    return migrate(v1.migrate(browserEvents))
  }

  return browserEvents
}

// The canonical schema for k6 Studio
const BrowserEventsSchema = AnyBrowserEventsSchema.transform(migrate)

export const RecordingSchema = z.object({
  // HAR log format version 1.2
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

    // _browserEvents is versioned individually from the HAR file
    _browserEvents: BrowserEventsSchema.optional(),
  }),
})

export type Recording = z.infer<typeof RecordingSchema>
