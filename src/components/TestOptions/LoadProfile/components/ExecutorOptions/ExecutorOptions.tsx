import { LoadProfileExecutorOptions } from '@/types/testOptions'
import { exhaustive } from '@/utils/typescript'

import { RampingVUs } from './RampingVUs'
import { SharedIterations } from './SharedIterations/SharedIterations'

export function ExecutorOptions({
  executor,
}: {
  executor: LoadProfileExecutorOptions['executor']
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
