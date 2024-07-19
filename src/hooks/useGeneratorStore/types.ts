import { RecordingSliceStore } from './slices/recording'
import { RulesSliceStore, TestDataStore, TestOptionsStore } from './slices'
import { GeneratorFileData } from '@/schemas/generator'
import { ProxyData } from '@/types'

export interface GeneratorState
  extends RecordingSliceStore,
    RulesSliceStore,
    TestDataStore,
    TestOptionsStore {
  name: string
  setName: (name: string) => void
  setGeneratorFile: (
    generatorFile: GeneratorFileData,
    recording?: ProxyData[]
  ) => void
}
