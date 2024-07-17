import { TestRule } from './rules'
import { Variable } from '.'
import { LoadProfileExecutorOptions, SleepTypeConfig } from './testOptions'

export interface GeneratorOptions {
  loadProfile: LoadProfileExecutorOptions
  thinkTime: SleepTypeConfig
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
