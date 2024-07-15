import { GroupedProxyData } from '@/types'
import {
  CommonOptions,
  RampingStage,
  RampingVUsOptions,
  SharedIterationsOptions,
} from '@/views/Generator/GeneratorDrawer/LoadProfile/types'
import { TestRule } from '@/types/rules'

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

export interface RulesState {
  rules: TestRule[]
  selectedRuleId: string | null
  createRule: (type: TestRule['type']) => void
  updateRule: (rule: TestRule) => void
  cloneRule: (id: string) => void
  deleteRule: (id: string) => void
  selectRule: (id: string) => void
}

export interface GeneratorState extends LoadProfileState, RulesState {
  recording: GroupedProxyData
  requestFilters: string[]
  selectedRuleId: string | null
  setRecording: (recording: GroupedProxyData) => void
  resetRecording: () => void
  addRequestFilter: (filter: string) => void
}
