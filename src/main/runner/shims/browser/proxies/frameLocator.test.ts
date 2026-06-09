import { Page } from 'k6/browser'
import { describe, expect, it, vi } from 'vitest'

import '../../symbols'
import { createProxy } from '../utils'

import { pageProxy } from './page'

vi.hoisted(() => {
  ;(globalThis as { __ENV?: Record<string, string> }).__ENV = {}
})

// Raw k6 objects have no `$trace` member; the shim adds it by proxying. A locator
// reached through a frame must be proxied too, otherwise calling `$trace` on it
// throws `Object has no member '$trace'` at runtime.
function fakeLocator() {
  return {
    click: vi.fn(async () => {}),
    contentFrame: vi.fn(() => fakeFrameLocator()),
  }
}

function fakeFrameLocator() {
  return {
    locator: vi.fn(() => fakeLocator()),
    frameLocator: vi.fn(() => fakeFrameLocator()),
    getByRole: vi.fn(() => fakeLocator()),
  }
}

function fakePage() {
  return {
    on: vi.fn(),
    locator: vi.fn(() => fakeLocator()),
    frameLocator: vi.fn(() => fakeFrameLocator()),
    getByTitle: vi.fn(() => fakeLocator()),
  }
}

function proxiedPage() {
  return createProxy(pageProxy(fakePage() as unknown as Page))
}

describe('frame locator proxying', () => {
  it('exposes $trace on a locator inside a single css frame', () => {
    const locator = proxiedPage().frameLocator('#frame').locator('button')

    expect(() => locator.$trace('id')).not.toThrow()
  })

  it('exposes $trace on a locator inside nested css frames', () => {
    const locator = proxiedPage()
      .frameLocator('#outer')
      .frameLocator('#inner')
      .locator('button')

    expect(() => locator.$trace('id')).not.toThrow()
  })

  it('exposes $trace on a locator reached through contentFrame', () => {
    const locator = proxiedPage().getByTitle('Ad').contentFrame().locator('a')

    expect(() => locator.$trace('id')).not.toThrow()
  })

  // Mirrors the generated code shape: a frame-rooted, traced locator action must
  // resolve, proving the re-proxied locator stays usable downstream.
  it('runs a traced action on a locator inside a frame', async () => {
    await expect(
      proxiedPage()
        .frameLocator('#frame')
        .locator('button')
        .$trace('id')
        .click()
    ).resolves.toBeUndefined()
  })
})
