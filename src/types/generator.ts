import { z } from 'zod'
import { GeneratorFileDataSchema } from '@/schemas/generator'

export interface GeneratorFile {
  path: string
  content: GeneratorFileData
}

export type GeneratorFileData = z.infer<typeof GeneratorFileDataSchema>
