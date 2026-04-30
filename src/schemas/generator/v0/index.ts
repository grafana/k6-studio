import { z } from 'zod'

import * as v1 from '../v1'

import { TestRuleSchema } from './rules'
import { TestDataSchema } from './testData'
import { TestOptionsSchema } from './testOptions'

export const GeneratorFileDataSchema = z.object({
  version: z.literal('0'),
  recordingPath: z.string(),
  options: TestOptionsSchema,
  testData: TestDataSchema,
  rules: TestRuleSchema.array(),
  allowlist: z.string().array(),
  includeStaticAssets: z.boolean(),
  scriptName: z.string().default('my-script.js'),
})

export type GeneratorSchema = z.infer<typeof GeneratorFileDataSchema>

// Migrate generator to the next version
export function migrate(generator: GeneratorSchema): v1.GeneratorSchema {
  return {
    version: '1.0',
    recordingPath: generator.recordingPath,
    options: {
      ...generator.options,
      thresholds: [],
      cloud: {
        loadZones: { distribution: 'even', zones: [] },
      },
    },
    testData: { ...generator.testData, files: [] },
    // To please the schema addition defined in v1 we need to set the default value for extractionMode
    // since the rule was working in single mode before the addition of multiple mode we define that as default
    rules: generator.rules.map((rule) => {
      if (rule.type === 'correlation') {
        return {
          ...rule,
          extractor: { ...rule.extractor, extractionMode: 'single' },
        }
      }

      return rule
    }),
    allowlist: generator.allowlist,
    includeStaticAssets: generator.includeStaticAssets,
    scriptName: generator.scriptName,
  }
}
