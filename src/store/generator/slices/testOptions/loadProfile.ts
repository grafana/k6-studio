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
}

interface CommonState {
  executor: LoadProfileExecutorOptions['executor']
}

interface CommonActions {
  setExecutor: (value: LoadProfileExecutorOptions['executor']) => void
}

type CommonStore = CommonState & CommonActions

const createCommonSlice: ImmerStateCreator<CommonStore> = (set) => ({
  executor: 'ramping-vus',

  setExecutor: (value) =>
    set((state) => {
      state.executor = value
    }),
})

interface RampingActions {
  addStage: () => void
  removeStage: (index: number) => void
  updateStage: (index: number, value: RampingStage) => void
  setStages: (value: RampingStage[]) => void
}

type RampingStore = Omit<RampingVUsOptions, 'executor'> & RampingActions

const createRampingSlice: ImmerStateCreator<RampingStore> = (set) => ({
  stages: getInitialStages(),

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
  setStages: (value) =>
    set((state) => {
      state.stages = value
    }),
})

interface SharedIterationsActions {
  setIterations: (value: number | undefined) => void
  setVus: (value: number | undefined) => void
}

type SharedIterationsStore = Omit<SharedIterationsState, 'executor'> &
  SharedIterationsActions

const createSharedIterationsSlice: ImmerStateCreator<SharedIterationsStore> = (
  set
) => ({
  iterations: undefined,
  vus: undefined,

  setIterations: (value) =>
    set((state) => {
      state.iterations = value
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
