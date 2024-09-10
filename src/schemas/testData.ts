import { z } from 'zod'

export const VariableSchema = z.object({
  name: z.string().nonempty({ message: 'Required' }),
  value: z.string(),
})

export const TestDataSchema = z.object({
  variables: VariableSchema.array(),
})
