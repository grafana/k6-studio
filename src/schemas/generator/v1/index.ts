import { z } from 'zod'
import { TestRuleSchema } from '@/schemas/rules'
import { TestDataSchema } from '@/schemas/testData'
import { TestOptionsSchema } from '@/schemas/testOptions'

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

// TODO: Migrate generator to the next version
export function migrate(generator: z.infer<typeof GeneratorFileDataSchema>) {
  return { ...generator }
}