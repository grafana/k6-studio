import path from 'path'
import { z } from 'zod'

import * as v3 from '../v3'

import { TestRuleSchema } from './rules'
import { TestDataSchema } from './testData'
import { TestOptionsSchema } from './testOptions'

export const GeneratorFileDataSchema = z.object({
  version: z.literal('2.0'),
  recordingPath: z.string(),
  options: TestOptionsSchema,
  testData: TestDataSchema,
  rules: TestRuleSchema.array(),
  allowlist: z.string().array(),
  includeStaticAssets: z.boolean(),
  scriptName: z.string().default('my-script.js'),
})

export type GeneratorSchema = z.infer<typeof GeneratorFileDataSchema>

export function migrate(
  generator: z.infer<typeof GeneratorFileDataSchema>
): v3.GeneratorSchema {
  const relativeRecordingPath =
    generator.recordingPath !== ''
      ? `../Recordings/${path.basename(generator.recordingPath)}`
      : ''

  const files = generator.testData.files.map((file) => ({
    path: `../Data/${path.basename(file.name)}`,
  }))

  return {
    ...generator,
    version: '3.0',
    recordingPath: relativeRecordingPath,
    testData: {
      ...generator.testData,
      files,
    },
  }
}
