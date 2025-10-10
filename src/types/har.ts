import type { Entry, Response } from 'har-format'

// Response is required by HAR file spec, but we want
// to keep non-completed requests to be able to
// show them in the UI when loading HAR file
export interface EntryWithOptionalResponse extends Omit<Entry, 'response'> {
  response?: Response
}
