import { TestOptions } from '@/types/testOptions'
import { stringifyObject } from './codegen.utils'

export function generateOptions({ loadProfile }: TestOptions): string {
  return `{
    scenarios: {
      default: ${stringifyObject(loadProfile)}
    }
  }`
}
