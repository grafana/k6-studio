import { z } from 'zod'

import { exhaustive } from '@/utils/typescript'

import * as v1 from './v1'
import * as v2 from './v2'

const AnyBrowserTestSchema = z.discriminatedUnion('version', [
  v1.BrowserTestFileSchema,
  v2.BrowserTestFileSchema,
])

export function migrate(
  file: z.infer<typeof AnyBrowserTestSchema>
): v2.BrowserTestFile {
  switch (file.version) {
    case '1.0':
      return migrate(v2.migrate(file))
    case '2.0':
      return file
    default:
      return exhaustive(file)
  }
}

export const BrowserTestFileDataSchema = AnyBrowserTestSchema.transform(migrate)

export type BrowserTestFile = v2.BrowserTestFile

export * from './v2/testOptions'
