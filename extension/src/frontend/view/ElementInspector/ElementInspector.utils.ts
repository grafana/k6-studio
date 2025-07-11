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

    case 'check':
      return {
        type: 'check',
        inputType: data.inputType,
        expected: data.expected,
      }

    case 'input-value':
      return {
        type: 'value',
        expected: [data.expected],
      }

    case 'select-value':
      throw new Error(
        'Select value assertions are not supported in the recording schema'
      )

    default:
      return exhaustive(data)
  }
}
