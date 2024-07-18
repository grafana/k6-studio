import { z } from 'zod'

export const Variable = z.object({
  name: z.string(),
  value: z.string(),
})

export const TestData = z.object({
  variables: Variable.array(),
})

export type Variable = z.infer<typeof Variable>
export type TestData = z.infer<typeof TestData>
