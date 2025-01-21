import { z } from 'zod'
import { TestRuleSchema } from './rules'
import { TestDataSchema } from './testData'
import { TestOptionsSchema } from './testOptions'
import { ThresholdSchema } from './thresholds'

export const GeneratorFileDataSchema = z.object({
  version: z.literal('2.0'),
  recordingPath: z.string(),
  options: TestOptionsSchema,
  testData: TestDataSchema,
  rules: TestRuleSchema.array(),
  allowlist: z.string().array(),
  includeStaticAssets: z.boolean(),
  scriptName: z.string().default('my-script.js'),
  thresholds: z.array(ThresholdSchema),
})

export type GeneratorSchema = z.infer<typeof GeneratorFileDataSchema>

export function migrate(generator: z.infer<typeof GeneratorFileDataSchema>) {
  throw new Error('Not implemented', { cause: generator })
}
