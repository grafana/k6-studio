import { Page } from 'k6/browser'
import { describe, expect, it, vi } from 'vitest'

import '../../symbols'
import { injectSessionReplayIntoNewTab } from '../sessionReplay'
import { createProxy } from '../utils'

import { pageProxy } from './page'

vi.hoisted(() => {
  ;(globalThis as { __ENV?: Record<string, string> }).__ENV = {}
})

vi.mock('../sessionReplay', () => ({
  injectSessionReplayIntoNewTab: vi.fn(() => Promise.resolve()),
}))

// Raw k6 objects have no `$trace` member; the shim adds it by proxying. A page
// obtained through `page.context().waitForEvent('page')` (a click that opens a
// new tab) must be proxied too, otherwise calling `$trace` on it throws
// `Object has no member '$trace'` at runtime.
function fakeLocator() {
  return {
    click: vi.fn(async () => {}),
  }
}

function fakeContext() {
  return {
    waitForEvent: vi.fn(() => Promise.resolve(fakePage())),
  }
}

function fakePage(): object {
  return {
    on: vi.fn(),
    locator: vi.fn(() => fakeLocator()),
    goto: vi.fn(async () => {}),
    close: vi.fn(async () => {}),
    reload: vi.fn(async () => {}),
    evaluate: vi.fn(async () => {}),
    context: vi.fn(() => fakeContext()),
  }
}

function proxiedPage() {
  return createProxy(pageProxy(fakePage() as unknown as Page))
}

describe('new tab page proxying', () => {
  it('exposes $trace on a page returned by waitForEvent', async () => {
    const newPage = await proxiedPage().context().waitForEvent('page')

    expect(() => newPage.$trace('id')).not.toThrow()
  })

  // k6 does not apply context init scripts to pages opened by the page itself
  // (e.g. a click on a target="_blank" link), so the shim injects the session
  // replay recorder before the test can act on the page.
  it('injects the session replay recorder before handing the page over', async () => {
    const injected = vi.mocked(injectSessionReplayIntoNewTab)

    injected.mockClear()

    const newPage = await proxiedPage().context().waitForEvent('page')

    expect(injected).toHaveBeenCalledOnce()
    expect(newPage).toBeDefined()
  })

  // Session replay is non-critical: a popup that is still navigating can
  // reject the injection evaluates, and that must not fail the test.
  it('hands the page over even when the recorder injection fails', async () => {
    const injected = vi.mocked(injectSessionReplayIntoNewTab)

    injected.mockRejectedValueOnce(new Error('execution context destroyed'))

    const newPage = await proxiedPage().context().waitForEvent('page')

    expect(newPage).toBeDefined()
  })

  // Mirrors the generated code shape: the click that opened the tab is awaited
  // elsewhere; the test then acts on the new page through a traced locator.
  it('runs a traced action on a locator of the new page', async () => {
    const newPage = await proxiedPage().context().waitForEvent('page')

    await expect(
      newPage.$trace('id').locator('button').click()
    ).resolves.toBeUndefined()
  })
})
