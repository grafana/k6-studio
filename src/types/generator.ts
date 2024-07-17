import { TestRule } from './rules'
import { Variable } from '.'
import { LoadProfileExecutorOptions, ThinkTime } from './testOptions'

export interface GeneratorOptions {
  loadProfile: LoadProfileExecutorOptions
  thinkTime: ThinkTime
}

export interface GeneratorTestData {
  variables: Variable[]
}

export interface GeneratorFile {
  name: string
  version: string
  recordingPath: string
  options: GeneratorOptions
  testData: GeneratorTestData
  rules: TestRule[]
  allowlist: string[]
}
