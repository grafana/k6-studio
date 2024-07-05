import { ExecutorType } from '@/constants/generator'
import { GeneratorState } from '@/hooks/useGeneratorStore/types'

import { RampingVUs } from './RampingVUs'
import { SharedIterations } from './SharedIterations/SharedIterations'

export function ExecutorOptions(options: GeneratorState) {
  switch (options.executor) {
    case ExecutorType.RampingVUs:
      return (
        <RampingVUs
          stages={options.stages}
          gracefulRampDown={options.gracefulRampDown}
          startVUs={options.startVUs}
        />
      )
    case ExecutorType.SharedIterations:
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
