import { z } from 'zod'
import { TestRule } from '@/schemas/rules'
import { TestData } from '@/schemas/testData'
import { TestOptions } from '@/schemas/testOptions'

export const GeneratorFileData = z.object({
  name: z.string(),
  version: z.string(),
  recordingPath: z.string(),
  options: TestOptions,
  testData: TestData,
  rules: TestRule.array(),
  allowlist: z.string().array(),
})

export type GeneratorFileData = z.infer<typeof GeneratorFileData>
