import { ExecutorType } from '@/constants/generator'
import { ImmerStateCreator } from '@/utils/typescript'

import {
  CommonProfileState,
  LoadProfileState,
  RampingVUsState,
  SharedIterationsState,
} from '../types'

const createStage = () => ({
  target: '',
  duration: '',
})

const createCommonSlice: ImmerStateCreator<CommonProfileState> = (set) => ({
  executor: ExecutorType.RampingVUs,

  setExecutor: (value) =>
    set((state) => {
      state.executor = value
    }),
  setStartTime: (value) =>
    set((state) => {
      state.startTime = value
    }),
  setGracefulStop: (value) =>
    set((state) => {
      state.gracefulStop = value
    }),
})

const createRampingSlice: ImmerStateCreator<RampingVUsState> = (set) => ({
  gracefulRampDown: undefined,
  stages: [],
  startVUs: undefined,

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
  setGracefulRampDown: (value) =>
    set((state) => {
      state.gracefulRampDown = value
    }),
  setStartVUs: (value) =>
    set((state) => {
      state.startVUs = value
    }),
})

const createSharedIterationsSlice: ImmerStateCreator<SharedIterationsState> = (
  set
) => ({
  vus: undefined,
  iterations: undefined,
  maxDuration: undefined,

  setVus: (value) =>
    set((state) => {
      state.vus = value
    }),
  setIterations: (value) =>
    set((state) => {
      state.iterations = value
    }),
  setMaxDuration: (value) =>
    set((state) => {
      state.maxDuration = value
    }),
})

export const createLoadProfileSlice: ImmerStateCreator<LoadProfileState> = (
  set,
  get,
  store
) => ({
  ...createCommonSlice(set, get, store),
  ...createRampingSlice(set, get, store),
  ...createSharedIterationsSlice(set, get, store),
})
