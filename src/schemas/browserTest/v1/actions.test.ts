import { describe, expect, test } from 'vitest'

import { targetLocatorOptions } from '@/schemas/locator'

import { AnyBrowserActionSchema } from './actions'

describe('AnyBrowserActionSchema frame chain', () => {
  test('retains the frames chain on a locator action', () => {
    const frames = [
      targetLocatorOptions({ type: 'css', selector: 'iframe#outer' }),
      targetLocatorOptions({ type: 'css', selector: 'iframe#inner' }),
    ]
    const action = {
      id: 'a1',
      method: 'locator.click',
      locator: targetLocatorOptions({ type: 'css', selector: 'button' }),
      frames,
    }

    const result = AnyBrowserActionSchema.parse(action)

    // `frames` entries are stored as plain locator values, without the
    // target's `type`/`parents` fields, so those get stripped on parse.
    expect(result).toMatchObject({
      method: 'locator.click',
      frames: frames.map(({ type: _type, parents: _parents, ...rest }) => rest),
    })
  })

  test('omits frames for top-frame actions', () => {
    const action = {
      id: 'a1',
      method: 'locator.click',
      locator: targetLocatorOptions({ type: 'css', selector: 'button' }),
    }

    const result = AnyBrowserActionSchema.parse(action)

    expect('frames' in result && result.frames).toBeFalsy()
  })
})
