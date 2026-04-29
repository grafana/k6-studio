import { z } from 'zod/v4'

import {
  VariableSchema,
  TestDataSchema,
  DataFileSchema,
} from '@/schemas/generator'

export type Variable = z.infer<typeof VariableSchema>
export type TestData = z.infer<typeof TestDataSchema>
export type DataFile = z.infer<typeof DataFileSchema>

export type DataRecord = Record<
  string,
  string | number | boolean | object | null
>

export type DataFilePreview = {
  type: 'json' | 'csv'
  props: string[]
  data: DataRecord[]
  total: number
}
