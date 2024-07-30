import {
  LoadProfileExecutorOptions,
  RampingStage,
  RampingVUsOptions,
  SharedIterationsOptions,
} from '@/types/testOptions'
import { createStage, getInitialStages } from '@/utils/generator'
import { ImmerStateCreator } from '@/utils/typescript'

interface SharedIterationsState
  extends Omit<SharedIterationsOptions, 'executor'> {
  setVus: (value: SharedIterationsOptions['vus']) => void
  setIterations: (value: SharedIterationsOptions['iterations']) => void
  setMaxDuration: (value: SharedIterationsOptions['maxDuration']) => void
}

interface CommonState {
  executor: LoadProfileExecutorOptions['executor']
  gracefulStop: string | undefined
  startTime: string | undefined
}

interface CommonActions {
  setExecutor: (value: LoadProfileExecutorOptions['executor']) => void
  setGracefulStop: (value: string | undefined) => void
  setStartTime: (value: string | undefined) => void
}

type CommonStore = CommonState & CommonActions

const createCommonSlice: ImmerStateCreator<CommonStore> = (set) => ({
  executor: 'ramping-vus',
  gracefulStop: undefined,
  startTime: undefined,

  setExecutor: (value) =>
    set((state) => {
      state.executor = value
    }),
  setGracefulStop: (value) =>
    set((state) => {
      state.gracefulStop = value
    }),
  setStartTime: (value) =>
    set((state) => {
      state.startTime = value
    }),
})

interface RampingActions {
  addStage: () => void
  removeStage: (index: number) => void
  updateStage: (index: number, value: RampingStage) => void
  setGracefulRampDown: (value: RampingVUsOptions['gracefulRampDown']) => void
  setStartVUs: (value: RampingVUsOptions['startVUs']) => void
}

type RampingStore = Omit<RampingVUsOptions, 'executor'> & RampingActions

const createRampingSlice: ImmerStateCreator<RampingStore> = (set) => ({
  gracefulRampDown: undefined,
  stages: getInitialStages(),
  startVUs: undefined,

  setGracefulRampDown: (value) =>
    set((state) => {
      state.gracefulRampDown = value
    }),
  addStage: () =>
    set((state) => {
      state.stages.push(createStage())
    }),
  removeStage: (index) =>
    set((state) => {
      state.stages.splice(index, 1)
    }),
  updateStage: (index, value) =>
    set((state) => {
      state.stages[index] = value
    }),
  setStartVUs: (value) =>
    set((state) => {
      state.startVUs = value
    }),
})

interface SharedIterationsActions {
  setIterations: (value: number | undefined) => void
  setMaxDuration: (value: string | undefined) => void
  setVus: (value: number | undefined) => void
}

type SharedIterationsStore = Omit<SharedIterationsState, 'executor'> &
  SharedIterationsActions

const createSharedIterationsSlice: ImmerStateCreator<SharedIterationsStore> = (
  set
) => ({
  iterations: undefined,
  maxDuration: undefined,
  vus: undefined,

  setIterations: (value) =>
    set((state) => {
      state.iterations = value
    }),
  setMaxDuration: (value) =>
    set((state) => {
      state.maxDuration = value
    }),
  setVus: (value) =>
    set((state) => {
      state.vus = value
    }),
})

export type LoadProfileStore = CommonStore &
  RampingStore &
  SharedIterationsStore

export const createLoadProfileSlice: ImmerStateCreator<LoadProfileStore> = (
  ...args
) => ({
  ...createCommonSlice(...args),
  ...createRampingSlice(...args),
  ...createSharedIterationsSlice(...args),
})
