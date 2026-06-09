import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  collectLayoutShiftWindows,
  observeWindowsForLayoutShift,
} from './layout'

interface FakeWindow {
  parent: FakeWindow
}

function fakeWindow(): FakeWindow {
  const win = {} as FakeWindow
  win.parent = win
  return win
}

describe('collectLayoutShiftWindows', () => {
  it('includes every frame on the path from content to root', () => {
    const top = fakeWindow()
    const middle = fakeWindow()
    const leaf = fakeWindow()

    middle.parent = top
    leaf.parent = middle

    const windows = collectLayoutShiftWindows(
      top as unknown as Window,
      leaf as unknown as Window
    )

    expect(windows).toEqual(
      new Set([top, middle, leaf].map((win) => win as unknown as Window))
    )
  })

  it('returns only the root when content is already in the root frame', () => {
    const top = fakeWindow()

    const windows = collectLayoutShiftWindows(
      top as unknown as Window,
      top as unknown as Window
    )

    expect(windows).toEqual(new Set([top as unknown as Window]))
  })
})

describe('observeWindowsForLayoutShift', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('calls back when an observed window scrolls', () => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(0)

      return 1
    })

    const onLayoutShift = vi.fn()
    const stop = observeWindowsForLayoutShift([window], onLayoutShift)

    window.dispatchEvent(new Event('scroll'))

    expect(onLayoutShift).toHaveBeenCalledTimes(1)

    stop()
  })

  it('coalesces several scrolls within a frame into one call', () => {
    const requestFrame = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockReturnValue(1)

    const onLayoutShift = vi.fn()
    const stop = observeWindowsForLayoutShift([window], onLayoutShift)

    window.dispatchEvent(new Event('scroll'))
    window.dispatchEvent(new Event('scroll'))
    window.dispatchEvent(new Event('scroll'))

    // Only one frame is scheduled for the burst, and it runs the callback once.
    expect(requestFrame).toHaveBeenCalledTimes(1)
    expect(onLayoutShift).not.toHaveBeenCalled()

    requestFrame.mock.calls[0]?.[0](0)

    expect(onLayoutShift).toHaveBeenCalledTimes(1)

    stop()
  })

  it('stops calling back after cleanup', () => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(0)

      return 1
    })

    const onLayoutShift = vi.fn()
    const stop = observeWindowsForLayoutShift([window], onLayoutShift)

    stop()

    window.dispatchEvent(new Event('scroll'))

    expect(onLayoutShift).not.toHaveBeenCalled()
  })
})
