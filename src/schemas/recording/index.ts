import { z } from 'zod'

import * as v1 from './browser/v1'
import * as v2 from './browser/v2'
import { LogSchema } from './har'

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
  log: LogSchema.extend({
    // _browserEvents is versioned individually from the HAR file
    _browserEvents: BrowserEventsSchema.optional(),
  }),
})

export * from './browser/v2'
export type Recording = z.infer<typeof RecordingSchema>
