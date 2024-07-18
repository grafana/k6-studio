import { TestRule } from './rules'
import { TestData } from '@/schemas/testData'
import { TestOptions } from '@/schemas/testOptions'

export interface GeneratorFileData {
  name: string
  version: string
  recordingPath: string
  options: TestOptions
  testData: TestData
  rules: TestRule[]
  allowlist: string[]
}

export interface GeneratorFile {
  path: string
  content: GeneratorFileData
}
