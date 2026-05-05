import { z } from 'zod/v4'

import { AnyBrowserActionSchema } from '@/main/runner/schema'

export const BrowserTestFileSchema = z.object({
  version: z.literal('1.0'),
  actions: AnyBrowserActionSchema.array(),
})

export type BrowserTestFile = z.infer<typeof BrowserTestFileSchema>
