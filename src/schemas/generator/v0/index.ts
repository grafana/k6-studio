import { z } from 'zod'
import { TestRuleSchema } from '@/schemas/rules'
import { TestDataSchema } from '@/schemas/testData'
import { TestOptionsSchema } from '@/schemas/testOptions'
import * as v1 from '../v1'

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
    allowlist: generator.allowlist,
    includeStaticAssets: generator.includeStaticAssets,
    options: generator.options,
    recordingPath: generator.recordingPath,
    rules: generator.rules,
    scriptName: generator.scriptName,
    testData: generator.testData,
  }
}