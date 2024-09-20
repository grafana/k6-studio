import { z } from 'zod'
import { TestRuleSchema } from '@/schemas/rules'
import { TestDataSchema } from '@/schemas/testData'
import { TestOptionsSchema } from '@/schemas/testOptions'

export const GeneratorFileDataSchema = z.object({
  version: z.string(),
  recordingPath: z.string(),
  options: TestOptionsSchema,
  testData: TestDataSchema,
  rules: TestRuleSchema.array(),
  allowlist: z.string().array(),
  includeStaticAssets: z.boolean(),
  scriptName: z.string().default('my-script.js'),
})
