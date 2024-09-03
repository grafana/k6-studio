import { GeneratorStore } from '@/store/generator'

import { RampingVUs } from './RampingVUs'
import { SharedIterations } from './SharedIterations/SharedIterations'

export function ExecutorOptions(options: GeneratorStore) {
  switch (options.executor) {
    case 'ramping-vus':
      return <RampingVUs stages={options.stages} />
    case 'shared-iterations':
      return (
        <SharedIterations iterations={options.iterations} vus={options.vus} />
      )

    default:
      return null
  }
}
