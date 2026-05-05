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
    ...(cloud && generateCloudOptions(cloud)),
    ...(thresholds.length > 0 && {
      thresholds: generateThresholds(thresholds),
    }),
  }
  return stringify(data)
}
