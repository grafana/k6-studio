import { Assertion, BrowserEventTarget } from '@/schemas/recording'
import { exhaustive } from '@/utils/typescript'

import { getFramePathForElement } from '../../frames'

import { AssertionData } from './assertions/types'
import { InspectedElement } from './utils'

/**
 * The frame path a recorded event should carry for `element`: a live element
 * can walk its own DOM to find it, while a remote element only knows the
 * frame path the relay resolved when it was picked.
 */
export function getFramesForElement(
  element: InspectedElement | null
): BrowserEventTarget[] {
  if (element === null) {
    return []
  }

  return element.kind === 'live'
    ? getFramePathForElement(element.element)
    : (element.framePath ?? [])
}

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

    case 'text-input':
      return {
        type: 'text-input',
        expected: data.expected,
      }

    default:
      return exhaustive(data)
  }
}
