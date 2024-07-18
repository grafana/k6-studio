import { TestRule } from './rules'
import { Variable } from '.'
import { GeneratorOptions } from '@/schemas/generator'

export interface GeneratorTestData {
  variables: Variable[]
}

export interface GeneratorFileData {
  name: string
  version: string
  recordingPath: string
  options: GeneratorOptions
  testData: GeneratorTestData
  rules: TestRule[]
  allowlist: string[]
}

export interface GeneratorFile {
  path: string
  content: GeneratorFileData
}
