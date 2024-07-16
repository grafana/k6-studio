import { LoadProfileExecutorOptions } from '@/views/Generator/GeneratorDrawer/LoadProfile/types'
import { TestRule } from './rules'
import { Variable } from '.'
import { ThinkTimeState } from '@/hooks/useGeneratorStore/types'

export interface GeneratorOptions {
  loadProfile: LoadProfileExecutorOptions
  thinkTime: ThinkTimeState
}

export interface GeneratorTestData {
  variables: Variable[]
}

export interface GeneratorFile {
  name: string
  version: string
  options: GeneratorOptions
  testData: GeneratorTestData
  rules: TestRule[]
  allowlist: string[]
}
