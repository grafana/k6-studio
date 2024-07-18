import { z } from 'zod'
import { ThinkTime, LoadProfileExecutorOptions } from '@/schemas/testOptions'

export const GeneratorOptions = z.object({
  loadProfile: LoadProfileExecutorOptions,
  thinkTime: ThinkTime,
})

export type GeneratorOptions = z.infer<typeof GeneratorOptions>
