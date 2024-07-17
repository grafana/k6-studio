import { z } from 'zod'

const Variable = z.object({
  name: z.string(),
  value: z.string(),
})

export const GeneratorTestData = z.object({
  variables: Variable.array(),
})

type Variable = z.infer<typeof Variable>
export type GeneratorTestData = z.infer<typeof GeneratorTestData>
