import { GeneratorFileData } from '@/schemas/generator'

export interface GeneratorFile {
  path: string
  content: GeneratorFileData
}
