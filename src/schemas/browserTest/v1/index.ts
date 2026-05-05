import { z } from 'zod'

import { AnyBrowserActionSchema } from '@/main/runner/schema'

import { BrowserTestOptionsSchema } from './testOptions'

export const BrowserTestFileSchema = z.object({
  version: z.literal('1.0'),
  actions: AnyBrowserActionSchema.array(),
  settings: BrowserTestOptionsSchema,
})

export type BrowserTestFile = z.infer<typeof BrowserTestFileSchema>

export * from './testOptions'
