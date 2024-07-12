import { GroupedProxyData } from '@/types'
import { TestRule } from '@/types/rules'
import {
  CommonOptions,
  RampingStage,
  RampingVUsOptions,
  SharedIterationsOptions,
} from '@/views/Generator/GeneratorDrawer/LoadProfile/types'

export interface CommonProfileState extends CommonOptions {
  setExecutor: (value: CommonOptions['executor']) => void
  setGracefulStop: (value: CommonOptions['gracefulStop']) => void
  setStartTime: (value: CommonOptions['startTime']) => void
}

export interface RampingVUsState extends Omit<RampingVUsOptions, 'executor'> {
  addStage: () => void
  removeStage: (index: number) => void
  updateStage: (index: number, value: RampingStage) => void
  setGracefulRampDown: (value: RampingVUsOptions['gracefulRampDown']) => void
  setStartVUs: (value: RampingVUsOptions['startVUs']) => void
}

export interface SharedIterationsState
  extends Omit<SharedIterationsOptions, 'executor'> {
  setVus: (value: SharedIterationsOptions['vus']) => void
  setIterations: (value: SharedIterationsOptions['iterations']) => void
  setMaxDuration: (value: SharedIterationsOptions['maxDuration']) => void
}

export type LoadProfileState = CommonProfileState &
  RampingVUsState &
  SharedIterationsState

export interface GeneratorState extends LoadProfileState {
  recording: GroupedProxyData
  rules: TestRule[]
  requestFilters: string[]
  selectedRuleId: string | null
  setRecording: (recording: GroupedProxyData) => void
  resetRecording: () => void
  addRequestFilter: (filter: string) => void
  createRule: (type: TestRule['type']) => void
  updateRule: (rule: TestRule) => void
  cloneRule: (id: string) => void
  deleteRule: (id: string) => void
  selectRule: (id: string) => void
}
