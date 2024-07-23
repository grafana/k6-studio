import { GeneratorState } from '@/store/generator/types'

import { RampingVUs } from './RampingVUs'
import { SharedIterations } from './SharedIterations/SharedIterations'

export function ExecutorOptions(options: GeneratorState) {
  switch (options.executor) {
    case 'ramping-vus':
      return (
        <RampingVUs
          stages={options.stages}
          gracefulRampDown={options.gracefulRampDown}
          startVUs={options.startVUs}
        />
      )
    case 'shared-iterations':
      return (
        <SharedIterations
          iterations={options.iterations}
          maxDuration={options.maxDuration}
          vus={options.vus}
        />
      )

    default:
      return null
  }
}
