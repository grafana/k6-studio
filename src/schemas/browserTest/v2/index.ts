import { z } from 'zod'

import { AnyBrowserActionSchema } from '@/main/runner/schema'

import * as v1 from '../v1'

import {
  BrowserTestOptionsSchema,
  defaultBrowserTestOptions,
} from './testOptions'

export const BrowserTestFileSchema = z.object({
  version: z.literal('2.0'),
  actions: AnyBrowserActionSchema.array(),
  settings: BrowserTestOptionsSchema,
})

export type BrowserTestFile = z.infer<typeof BrowserTestFileSchema>

export function migrate(file: v1.BrowserTestFile): BrowserTestFile {
  return {
    version: '2.0',
    actions: file.actions,
    settings: defaultBrowserTestOptions,
  }
}

export * from './testOptions'
