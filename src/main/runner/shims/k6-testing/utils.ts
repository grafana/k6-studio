import { AssertionBeginEvent, AssertionEndEvent } from '../../schema'
import { TRACKING_SERVER_URL, TrackingClient } from '../utils'

import { serializeValue } from './serialize'

const client = new TrackingClient('k6-testing')

const KNOWN_MATCHERS = new Set([
  'toBeChecked',
  'toBeDisabled',
  'toBeEditable',
  'toBeEmpty',
  'toBeEnabled',
  'toBeHidden',
  'toBeVisible',
  'toHaveAttribute',
  'toHaveText',
  'toContainText',
  'toHaveTitle',
  'toHaveValue',
  'toBe',
  'toBeCloseTo',
  'toBeGreaterThan',
  'toBeGreaterThanOrEqual',
  'toBeLessThan',
  'toBeLessThanOrEqual',
  'toBeDefined',
  'toBeFalsy',
  'toBeInstanceOf',
  'toBeNaN',
  'toBeNull',
  'toBeTruthy',
  'toBeUndefined',
  'toEqual',
  'toContain',
  'toContainEqual',
  'toHaveLength',
  'toHaveProperty',
])

export function beginAssertion(
  name: string,
  negated: boolean,
  actual: unknown,
  args: unknown[]
): AssertionBeginEvent | null {
  if (TRACKING_SERVER_URL === null) {
    return null
  }

  return client.begin({
    type: 'assertion',
    state: 'begin',
    eventId: client.nextId(),
    timestamp: { started: Date.now() },
    actual: serializeValue(actual),
    assertion: {
      name,
      matcher: KNOWN_MATCHERS.has(name) ? name : undefined,
      negated,
      args: args.map(serializeValue),
    } as unknown as AssertionBeginEvent['assertion'],
  })
}

export function endAssertion(
  event: AssertionBeginEvent | null,
  result: AssertionEndEvent['result']
) {
  if (event === null) {
    return
  }

  client.end({
    ...event,
    state: 'end',
    timestamp: {
      ...event.timestamp,
      ended: Date.now(),
    },
    result,
  })
}
