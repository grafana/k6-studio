import { ExecutorType } from '@/constants/generator'
import type {
  CommonOptions,
  SharedIterationsOptions,
} from '@/schemas/testOptions'

export const COMMON_DEFAULTS: CommonOptions = {
  executor: ExecutorType.RampingVUs,
  startTime: undefined,
  gracefulStop: '30s',
}

export const SHARED_ITERATIONS_DEFAULTS: Omit<
  SharedIterationsOptions,
  'executor'
> = {
  ...COMMON_DEFAULTS,
  vus: 20,
  iterations: 200,
  maxDuration: '10m',
}
