import { GroupedProxyData } from '@/types'
import { TestRule } from '@/types/rules'
import {
  CommonOptions,
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
  setRecording: (recording: GroupedProxyData) => void
  resetRecording: () => void
  addRequestFilter: (filter: string) => void
}
