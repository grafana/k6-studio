import { Assertion } from '@/schemas/recording'
import { exhaustive } from '@/utils/typescript'

import { AssertionData } from './assertions/types'

export function toAssertion(data: AssertionData): Assertion {
  switch (data.type) {
    case 'visibility':
      return {
        type: 'visibility',
        visible: data.state === 'visible',
      }

    case 'text':
      return {
        type: 'text',
        operation: {
          type: 'contains',
          value: data.text,
        },
      }

    default:
      return exhaustive(data)
  }
}
