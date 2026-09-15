// The monitor only arms while the page is still on the initial empty document,
// so every test in this file runs against a document with that URL.
// @vitest-environment jsdom
// @vitest-environment-options { "url": "about:blank" }

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { monitorDocumentChange } from './monitor'

function replaceDocument() {
  vi.stubGlobal('document', document.implementation.createHTMLDocument())
}

describe('monitorDocumentChange', () => {
  beforeEach(() => {
    // If the environment options above ever stop being applied, the monitor
    // early-returns and every test below passes without polling anything.
    expect(document.location.href).toBe('about:blank')

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('reports a document instance that is replaced while polling', () => {
    const onChange = vi.fn()

    monitorDocumentChange(onChange)

    vi.advanceTimersByTime(50)

    expect(onChange).not.toHaveBeenCalled()
    expect(vi.getTimerCount()).toBeGreaterThan(0)

    replaceDocument()

    vi.advanceTimersByTime(1)

    expect(onChange).toHaveBeenCalledOnce()
  })

  it('stops polling once disposed', () => {
    const onChange = vi.fn()

    const stopMonitoring = monitorDocumentChange(onChange)

    vi.advanceTimersByTime(50)

    stopMonitoring()

    replaceDocument()

    vi.advanceTimersByTime(50)

    expect(onChange).not.toHaveBeenCalled()

    // Once the poll stops rescheduling itself only the auto-stop timeout is
    // left, and that one drains when its window has passed.
    vi.advanceTimersByTime(5000)

    expect(vi.getTimerCount()).toBe(0)
  })

  it('returns a dispose when there is nothing to monitor', () => {
    const onChange = vi.fn()

    vi.stubGlobal('document', { location: { href: 'https://example.com/' } })

    const stopMonitoring = monitorDocumentChange(onChange)

    stopMonitoring()

    expect(vi.getTimerCount()).toBe(0)
    expect(onChange).not.toHaveBeenCalled()
  })
})
