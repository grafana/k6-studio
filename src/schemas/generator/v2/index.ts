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
  return {
    ...generator,
    version: '3.0',
    // In v3 recordings are stored relative to the generator file. Since all v2
    // recordings are in the Recordings/ folder, we need to update the path accordingly.
    recordingPath:
      generator.recordingPath && `../Recordings/${generator.recordingPath}`,
    testData: {
      ...generator.testData,
      files: generator.testData.files.map((file) => {
        return {
          ...file,
          name: `../Data/${file.name}`,
        }
      }),
    },
  }
}
