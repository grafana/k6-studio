import { z } from 'zod'
import { GeneratorFileDataSchema } from '@/schemas/generator'

export interface GeneratorFile {
  name: string
  content: GeneratorFileData
}

export type GeneratorFileData = z.infer<typeof GeneratorFileDataSchema>
