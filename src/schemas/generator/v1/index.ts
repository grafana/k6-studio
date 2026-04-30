import { z } from 'zod'

import * as v2 from '../v2'

import { TestRuleSchema } from './rules'
import { TestDataSchema } from './testData'
import { TestOptionsSchema } from './testOptions'

export const GeneratorFileDataSchema = z.object({
  version: z.literal('1.0'),
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
): v2.GeneratorSchema {
  return {
    ...generator,
    version: '2.0',
    rules: generator.rules.map((rule) => {
      if (rule.type === 'verification') {
        return {
          ...rule,
          target: 'status',
          operator: 'equals',
          value: { type: 'recordedValue' },
        }
      }
      return rule
    }),
  }
}
