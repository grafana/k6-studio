import { z } from 'zod'

const CssHighlightSelectorSchema = z.object({
  type: z.literal('css'),
  selector: z.string(),
})

export const HighlightSelectorSchema = z.discriminatedUnion('type', [
  CssHighlightSelectorSchema,
])

export type HighlightSelector = z.infer<typeof HighlightSelectorSchema>

export interface Position {
  top: number
  left: number
}

export interface Bounds extends Position {
  width: number
  height: number
}

export type Tool = 'inspect' | 'assert-text'
