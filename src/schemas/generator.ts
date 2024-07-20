import { z } from 'zod'
import { TestRule } from '@/schemas/rules'
import { TestDataSchema } from '@/schemas/testData'
import { TestOptionsSchema } from '@/schemas/testOptions'

export const GeneratorFileData = z.object({
  name: z.string(),
  version: z.string(),
  recordingPath: z.string(),
  options: TestOptionsSchema,
  testData: TestDataSchema,
  rules: TestRule.array(),
  allowlist: z.string().array(),
})

export type GeneratorFileData = z.infer<typeof GeneratorFileData>
