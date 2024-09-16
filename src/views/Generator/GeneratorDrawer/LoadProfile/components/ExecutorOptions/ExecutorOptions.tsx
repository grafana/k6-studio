import { GeneratorStore } from '@/store/generator'

import { RampingVUs } from './RampingVUs'
import { SharedIterations } from './SharedIterations/SharedIterations'
import { exhaustive } from '@/utils/typescript'

export function ExecutorOptions({
  executor,
}: {
  executor: GeneratorStore['executor']
}) {
  switch (executor) {
    case 'ramping-vus':
      return <RampingVUs />
    case 'shared-iterations':
      return <SharedIterations />

    default:
      return exhaustive(executor)
  }
}
