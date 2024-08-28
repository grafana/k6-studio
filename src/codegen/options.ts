import { TestOptions } from '@/types/testOptions'
import { stringify } from './codegen.utils'

export function generateOptions({ loadProfile }: TestOptions): string {
  return stringify(loadProfile)
}
