import { afterEach, describe, expect, it, vi } from 'vitest'

import { observeWindowsForLayoutShift } from './observeLayoutShift'

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
