import { RecordingSliceStore } from './slices/recording'
import { RulesSliceStore, TestDataStore, TestOptionsStore } from './slices'

export interface GeneratorState
  extends RecordingSliceStore,
    RulesSliceStore,
    TestDataStore,
    TestOptionsStore {
  name: string
  setName: (name: string) => void
}
