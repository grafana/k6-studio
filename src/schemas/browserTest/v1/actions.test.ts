import { describe, expect, test } from 'vitest'

import { cssLocatorOptions } from '@/schemas/locator'

import { AnyBrowserActionSchema } from './actions'

describe('AnyBrowserActionSchema frame chain', () => {
  test('retains the frames chain on a locator action', () => {
    const frames = [
      cssLocatorOptions('iframe#outer'),
      cssLocatorOptions('iframe#inner'),
    ]
    const action = {
      id: 'a1',
      method: 'locator.click',
      locator: cssLocatorOptions('button'),
      frames,
    }

    const result = AnyBrowserActionSchema.parse(action)

    expect(result).toMatchObject({
      method: 'locator.click',
      frames,
    })
  })

  test('omits frames for top-frame actions', () => {
    const action = {
      id: 'a1',
      method: 'locator.click',
      locator: cssLocatorOptions('button'),
    }

    const result = AnyBrowserActionSchema.parse(action)

    expect('frames' in result && result.frames).toBeFalsy()
  })
})
