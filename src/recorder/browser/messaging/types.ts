import { z } from 'zod/v4'

import { BrowserEventSchema } from '@/schemas/recording'

const TextLocatorOptions = z
  .object({
    exact: z.boolean().optional(),
  })
  .optional()

const ActionLocatorSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('css'), selector: z.string() }),
  z.object({
    type: z.literal('role'),
    role: z.string(),
    options: z
      .object({ name: z.string().optional(), exact: z.boolean().optional() })
      .optional(),
  }),
  z.object({ type: z.literal('testid'), testId: z.string() }),
  z.object({
    type: z.literal('alt'),
    text: z.string(),
    options: TextLocatorOptions,
  }),
  z.object({
    type: z.literal('label'),
    label: z.string(),
    options: TextLocatorOptions,
  }),
  z.object({
    type: z.literal('placeholder'),
    placeholder: z.string(),
    options: TextLocatorOptions,
  }),
  z.object({
    type: z.literal('title'),
    title: z.string(),
    options: TextLocatorOptions,
  }),
  z.object({
    type: z.literal('text'),
    text: z.string(),
    options: TextLocatorOptions,
  }),
])

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
  selector: ActionLocatorSchema.nullable(),
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
