import type {
  CommonOptions,
  SharedIterationsOptions,
} from '@/types/testOptions'

export const COMMON_DEFAULTS: CommonOptions = {
  executor: 'ramping-vus',
}

export const SHARED_ITERATIONS_DEFAULTS: Omit<
  SharedIterationsOptions,
  'executor'
> = {
  ...COMMON_DEFAULTS,
  vus: 20,
  iterations: 200,
}
