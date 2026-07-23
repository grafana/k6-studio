import { omit } from 'lodash-es'

import { TestOptions } from '@/types/testOptions'

import { stringify } from './codegen.utils'
import { generateCloudOptions, generateThresholds } from './options.shared'

export {
  generateCloudOptions,
  generateLoadZones,
  generateThresholds,
} from './options.shared'

export function generateOptions({
  loadProfile,
  thresholds,
  cloud,
}: TestOptions): string {
  const options = omit(loadProfile, ['executor'])
  const data = {
    ...options,
    // Stages carry a synthetic key for editor bookkeeping only; it has no
    // meaning to k6 and must not leak into the generated script.
    ...(loadProfile.executor === 'ramping-vus' && {
      stages: loadProfile.stages.map((stage) => omit(stage, ['key'])),
    }),
    ...(cloud && generateCloudOptions(cloud)),
    ...(thresholds.length > 0 && {
      thresholds: generateThresholds(thresholds),
    }),
  }
  return stringify(data)
}
