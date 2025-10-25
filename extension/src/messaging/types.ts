import { z } from 'zod'

import { BrowserEventSchema } from '@/schemas/recording'

export const LoadEventsSchema = z.object({
  type: z.literal('load-events'),
})

export const EventsLoadedSchema = z.object({
  type: z.literal('events-loaded'),
  events: z.array(BrowserEventSchema),
})

export const RecordEventsSchema = z.object({
  type: z.literal('record-events'),
  events: z.array(BrowserEventSchema),
})

export const EventsRecordedSchema = z.object({
  type: z.literal('events-recorded'),
  events: z.array(BrowserEventSchema),
})

const CssHighlightSelectorSchema = z.object({
  type: z.literal('css'),
  selector: z.string(),
})

const HighlightSelectorSchema = z.discriminatedUnion('type', [
  CssHighlightSelectorSchema,
])

export const HighlightElementsSchema = z.object({
  type: z.literal('highlight-elements'),
  selector: HighlightSelectorSchema.nullable(),
})

export const NavigateSchema = z.object({
  type: z.literal('navigate'),
  url: z.string(),
})

export const StopRecordingSchema = z.object({
  type: z.literal('stop-recording'),
})

export const FocusTabSchema = z.object({
  type: z.literal('focus-tab'),
  tab: z.string(),
})

export const ReloadExtensionSchema = z.object({
  type: z.literal('reload-extension'),
})

export const BrowserExtensionMessageSchema = z.discriminatedUnion('type', [
  LoadEventsSchema,

  EventsLoadedSchema,
  RecordEventsSchema,
  EventsRecordedSchema,
  HighlightElementsSchema,
  NavigateSchema,
  StopRecordingSchema,
  FocusTabSchema,

  ReloadExtensionSchema,
])

export type RecordEvents = z.infer<typeof RecordEventsSchema>
export type EventsRecorded = z.infer<typeof EventsRecordedSchema>
export type HighlightSelector = z.infer<typeof HighlightSelectorSchema>
export type HighlightElements = z.infer<typeof HighlightElementsSchema>
export type Navigate = z.infer<typeof NavigateSchema>
export type StopRecording = z.infer<typeof StopRecordingSchema>
export type FocusTab = z.infer<typeof FocusTabSchema>
export type ReloadExtension = z.infer<typeof ReloadExtensionSchema>

export type BrowserExtensionMessage = z.infer<
  typeof BrowserExtensionMessageSchema
>
