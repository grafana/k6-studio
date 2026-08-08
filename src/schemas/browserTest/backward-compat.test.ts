import { describe, expect, test } from 'vitest'

import { BrowserTestFileCodec } from '@/schemas/browserTest'

const DEFAULT_OPTIONS = {
  loadProfile: { executor: 'ramping-vus', stages: [] },
  thresholds: [],
  loadZones: [],
}

describe('BrowserTestFileCodec backward compatibility', () => {
  test('decodes old-format locator without type field', () => {
    const oldFormatFile = JSON.stringify({
      version: '1.0',
      actions: [
        {
          id: 'a1',
          method: 'locator.click',
          locator: {
            current: 'css',
            values: { css: { type: 'css', selector: 'button.submit' } },
          },
        },
      ],
      options: DEFAULT_OPTIONS,
    })

    const result = BrowserTestFileCodec.decode(oldFormatFile)
    const action = result.actions[0]!

    expect(action.method).toBe('locator.click')

    if ('locator' in action) {
      expect(action.locator.type).toBe('element')
      expect(action.locator.parent).toBeUndefined()
    }
  })

  test('converts frames array to parent chain', () => {
    const oldFormatFile = JSON.stringify({
      version: '1.0',
      actions: [
        {
          id: 'a2',
          method: 'locator.click',
          locator: {
            current: 'css',
            values: { css: { type: 'css', selector: 'button.submit' } },
          },
          frames: [
            {
              current: 'css',
              values: { css: { type: 'css', selector: 'iframe#outer' } },
            },
            {
              current: 'css',
              values: { css: { type: 'css', selector: 'iframe#inner' } },
            },
          ],
        },
      ],
      options: DEFAULT_OPTIONS,
    })

    const result = BrowserTestFileCodec.decode(oldFormatFile)
    const action = result.actions[0]!

    if (!('locator' in action)) {
      throw new Error('Expected locator action')
    }

    expect(action.locator.type).toBe('element')

    // Parent chain should be innermost-first: inner.parent → outer
    const innerFrame = action.locator.parent
    expect(innerFrame).toBeDefined()
    expect(innerFrame?.type).toBe('frame')
    expect(innerFrame?.values.css?.selector).toBe('iframe#inner')

    const outerFrame = innerFrame?.parent
    expect(outerFrame).toBeDefined()
    expect(outerFrame?.type).toBe('frame')
    expect(outerFrame?.values.css?.selector).toBe('iframe#outer')

    expect(outerFrame?.parent).toBeUndefined()
  })

  test('decodes new-format locator with type field', () => {
    const newFormatFile = JSON.stringify({
      version: '1.0',
      actions: [
        {
          id: 'a3',
          method: 'locator.fill',
          value: 'hello',
          locator: {
            type: 'element',
            current: 'role',
            values: {
              role: { type: 'role', role: 'textbox', options: { exact: false } },
            },
            parent: {
              type: 'frame',
              current: 'css',
              values: { css: { type: 'css', selector: 'iframe' } },
            },
          },
        },
      ],
      options: DEFAULT_OPTIONS,
    })

    const result = BrowserTestFileCodec.decode(newFormatFile)
    const action = result.actions[0]!

    if (!('locator' in action)) {
      throw new Error('Expected locator action')
    }

    expect(action.locator.type).toBe('element')
    expect(action.locator.parent?.type).toBe('frame')
  })

  test('page-level actions without locator are unaffected', () => {
    const file = JSON.stringify({
      version: '1.0',
      actions: [
        { id: 'a4', method: 'page.goto', url: 'https://example.com' },
        { id: 'a5', method: 'page.reload' },
      ],
      options: DEFAULT_OPTIONS,
    })

    const result = BrowserTestFileCodec.decode(file)

    expect(result.actions[0]!.method).toBe('page.goto')
    expect(result.actions[1]!.method).toBe('page.reload')
  })

  test('round-trips new format through encode/decode', () => {
    const newFormatFile = JSON.stringify({
      version: '1.0',
      actions: [
        {
          id: 'a6',
          method: 'locator.click',
          locator: {
            type: 'element',
            current: 'css',
            values: { css: { type: 'css', selector: 'div' } },
            parent: {
              type: 'frame',
              current: 'css',
              values: { css: { type: 'css', selector: 'iframe' } },
            },
          },
        },
      ],
      options: DEFAULT_OPTIONS,
    })

    const decoded = BrowserTestFileCodec.decode(newFormatFile)
    const encoded = BrowserTestFileCodec.encode(decoded)
    const reDecoded = BrowserTestFileCodec.decode(encoded)

    expect(reDecoded.actions[0]!.method).toBe('locator.click')

    const action = reDecoded.actions[0]!
    if ('locator' in action) {
      expect(action.locator.type).toBe('element')
      expect(action.locator.parent?.type).toBe('frame')
    }
  })
})
