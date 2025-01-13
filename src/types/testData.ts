import { z } from 'zod'
import { VariableSchema, TestDataSchema } from '@/schemas/generator'

export type Variable = z.infer<typeof VariableSchema>
export type TestData = z.infer<typeof TestDataSchema>
