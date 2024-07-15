import { ProxyData } from '@/types'
import {
  CommonOptions,
  RampingStage,
  RampingVUsOptions,
  SharedIterationsOptions,
} from '@/views/Generator/GeneratorDrawer/LoadProfile/types'
import { TestRule } from '@/types/rules'

// load profile
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

// variables
export interface Variable {
  name: string
  value: string
}

export interface VariablesState {
  variables: Variable[]
}

export interface VariablesActions {
  setVariables: (variables: Variable[]) => void
}

// think time
export type SleepType = 'groups' | 'requests' | 'iterations'

export interface FixedTiming {
  type: 'fixed'
  value: number | null
}

export interface RangeTiming {
  type: 'range'
  value: {
    min: number | null
    max: number | null
  }
}

export type Timing = FixedTiming | RangeTiming

export interface ThinkTimeState {
  sleepType: SleepType
  timing: Timing
}

export interface ThinkTimeActions {
  setSleepType: (value: SleepType) => void
  setTiming: (timing: Timing) => void
}

export interface RulesState {
  rules: TestRule[]
  selectedRuleId: string | null
  createRule: (type: TestRule['type']) => void
  updateRule: (rule: TestRule) => void
  cloneRule: (id: string) => void
  deleteRule: (id: string) => void
  selectRule: (id: string) => void
}

export interface GeneratorState
  extends LoadProfileState,
    RulesState,
    VariablesState,
    VariablesActions,
    ThinkTimeState,
    ThinkTimeActions {
  requests: ProxyData[]
  setRecording: (recording: ProxyData[]) => void
  resetRecording: () => void
  allowList: string[]
  setAllowList: (value: string[]) => void
  filteredRequests: ProxyData[]
  setFilteredRequests: (requests: ProxyData[]) => void
  showAllowListDialog: boolean
  setShowAllowListDialog: (value: boolean) => void
}
