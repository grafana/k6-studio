import { TestOptions } from '@/types/testOptions'
import { stringify } from './codegen.utils'
import { omit } from 'lodash-es'

export function generateOptions({ loadProfile }: TestOptions): string {
  const data = omit(loadProfile, ['executor'])
  return stringify(data)
}
