import { z } from 'zod/v4'

import { ElementLocatorSchema, LocatorOptionsSchema } from '@/schemas/locator'
import { BrowserEventSchema } from '@/schemas/recording'

export const InBrowserSettingsSchema = z.object({
  toolbox: z.object({
    position: z.object({
      left: z.number(),
    }),
  }),
  clickRecordingMode: z
    .union([z.literal('interactive-only'), z.literal('any')])
    .optional()
    .default('interactive-only'),
})

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

export const HighlightElementsSchema = z.object({
  type: z.literal('highlight-elements'),
  locator: ElementLocatorSchema.nullable(),
  // Chain of iframe locators the element lives in, so highlighting can resolve
  // into nested frames. Absent for top-frame elements.
  frames: LocatorOptionsSchema.array().optional(),
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

export const SyncSettingsSchema = z.object({
  type: z.literal('sync-settings'),
  settings: InBrowserSettingsSchema.nullable(),
  tab: z.string(),
})

export const LoadSettingsSchema = z.object({
  type: z.literal('load-settings'),
  tab: z.string(),
})

export const SaveSettingsSchema = z.object({
  type: z.literal('save-settings'),
  settings: InBrowserSettingsSchema,
  tab: z.string(),
})

export const LoadToolStateSchema = z.object({
  type: z.literal('load-tool-state'),
  tab: z.string(),
  requestId: z.string(),
})

export const ToolStateRequestSchema = z.object({
  ...LoadToolStateSchema.shape,
  type: z.literal('tool-state-request'),
})

export const SyncToolStateSchema = z.object({
  type: z.literal('sync-tool-state'),
  tab: z.string(),
  session: z.string(),
  tool: z.enum(['inspect', 'assert-text']).nullable(),
  requestId: z.string().optional(),
})

export const ToolStateUpdateSchema = z.object({
  ...SyncToolStateSchema.shape,
  type: z.literal('tool-state-update'),
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

  LoadSettingsSchema,
  SyncSettingsSchema,
  SaveSettingsSchema,

  LoadToolStateSchema,
  SyncToolStateSchema,
  ToolStateRequestSchema,
  ToolStateUpdateSchema,

  ReloadExtensionSchema,
])

export type InBrowserSettings = z.infer<typeof InBrowserSettingsSchema>

export type RecordEvents = z.infer<typeof RecordEventsSchema>
export type EventsRecorded = z.infer<typeof EventsRecordedSchema>
export type HighlightElements = z.infer<typeof HighlightElementsSchema>
export type Navigate = z.infer<typeof NavigateSchema>
export type StopRecording = z.infer<typeof StopRecordingSchema>
export type FocusTab = z.infer<typeof FocusTabSchema>
export type ReloadExtension = z.infer<typeof ReloadExtensionSchema>

export type BrowserExtensionMessage = z.infer<
  typeof BrowserExtensionMessageSchema
>
