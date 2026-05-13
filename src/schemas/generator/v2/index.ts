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

// Generators historically stored only the basename of the recording and data
// files. Both lived in well-known sibling directories of the generator file:
// `../Recordings/<name>` for HARs and `../Data/<name>` for data files. v3
// stores those as paths relative to the generator file itself, so we prepend
// the historical sibling-directory prefix during migration.
export function migrate(
  generator: z.infer<typeof GeneratorFileDataSchema>
): v3.GeneratorSchema {
  return {
    ...generator,
    version: '3.0',
    recordingPath: generator.recordingPath
      ? `../Recordings/${generator.recordingPath}`
      : generator.recordingPath,
    testData: {
      ...generator.testData,
      files: generator.testData.files.map((file) => ({
        ...file,
        name: `../Data/${file.name}`,
      })),
    },
    rules: generator.rules.map((rule) => {
      if (
        rule.type === 'parameterization' &&
        rule.value.type === 'dataFileValue'
      ) {
        return {
          ...rule,
          value: {
            ...rule.value,
            fileName: `../Data/${rule.value.fileName}`,
          },
        }
      }

      return rule
    }),
  }
}
