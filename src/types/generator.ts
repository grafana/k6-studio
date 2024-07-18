import { TestRule } from './rules'
import { GeneratorOptions } from '@/schemas/generator'
import { TestData } from '@/schemas/testData'

export interface GeneratorFileData {
  name: string
  version: string
  recordingPath: string
  options: GeneratorOptions
  testData: TestData
  rules: TestRule[]
  allowlist: string[]
}

export interface GeneratorFile {
  path: string
  content: GeneratorFileData
}
