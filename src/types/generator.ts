import { TestRule } from './rules'
import { Variable } from '.'
import { LoadProfileExecutorOptions } from './testOptions'
import { ThinkTime } from '@/schemas/testOptions'

export interface GeneratorOptions {
  loadProfile: LoadProfileExecutorOptions
  thinkTime: ThinkTime
}

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
