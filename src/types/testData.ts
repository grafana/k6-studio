import { z } from 'zod'
import { VariableSchema, TestDataSchema } from '@/schemas/generator'

export type Variable = z.infer<typeof VariableSchema>
export type TestData = z.infer<typeof TestDataSchema>

export type DataFileItem = Record<
  string,
  string | number | boolean | object | null
>

export type DataFilePreview = {
  type: 'json' | 'csv'
  props: string[]
  data: DataFileItem[]
  total: number
}
