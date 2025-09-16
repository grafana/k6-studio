import { z } from 'zod'

export const GotoActionSchema = z.object({
  type: z.literal('goto'),
  url: z.string(),
})

export const ClickActionSchema = z.object({
  type: z.literal('click'),
  selector: z.string(),
})

export const BrowserActionSchema = z.discriminatedUnion('type', [
  GotoActionSchema,
  ClickActionSchema,
])

const ActionEventSchemaBase = z.object({
  eventId: z.string(),
  action: BrowserActionSchema,
})

export const ActionBeginEventSchema = ActionEventSchemaBase.extend({
  type: z.literal('begin'),
  timestamp: z.object({
    started: z.number(),
  }),
})

export const ActionSuccessSchema = z.object({
  type: z.literal('success'),
  returnValue: z.unknown().optional(),
})

export const ActionErrorSchema = z.object({
  type: z.literal('error'),
  error: z.string(),
})

export const ActionResult = z.discriminatedUnion('type', [
  ActionSuccessSchema,
  ActionErrorSchema,
])

export const ActionEndEventSchema = ActionEventSchemaBase.extend({
  type: z.literal('end'),
  timestamp: z.object({
    started: z.number(),
    ended: z.number(),
  }),
  result: ActionResult,
})

export const BrowserActionEventSchema = z.discriminatedUnion('type', [
  ActionBeginEventSchema,
  ActionEndEventSchema,
])

export type ActionBeginEvent = z.infer<typeof ActionBeginEventSchema>
export type ActionEndEvent = z.infer<typeof ActionEndEventSchema>

export type BrowserActionEvent = z.infer<typeof BrowserActionEventSchema>

export type ActionResult = z.infer<typeof ActionResult>

export type GotoAction = z.infer<typeof GotoActionSchema>
export type ClickAction = z.infer<typeof ClickActionSchema>
export type BrowserAction = z.infer<typeof BrowserActionSchema>
