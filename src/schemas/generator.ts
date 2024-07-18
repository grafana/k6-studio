import { z } from 'zod'
import { ThinkTime, LoadProfileExecutorOptions } from '@/schemas/testOptions'

export const GeneratorOptions = z.object({
  loadProfile: LoadProfileExecutorOptions,
  thinkTime: ThinkTime,
})

export type GeneratorOptions = z.infer<typeof GeneratorOptions>

const Variable = z.object({
  name: z.string(),
  value: z.string(),
})

export const GeneratorTestData = z.object({
  variables: Variable.array(),
})

type Variable = z.infer<typeof Variable>
export type GeneratorTestData = z.infer<typeof GeneratorTestData>
