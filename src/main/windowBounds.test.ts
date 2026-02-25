import { describe, expect, it } from 'vitest'

import { resolveWindowBounds } from './windowBounds'

describe('resolveWindowBounds', () => {
  const primaryDisplay = { x: 0, y: 0, width: 1920, height: 1080 }

  it('keeps bounds when the window is visible on the primary display', () => {
    const windowBounds = { x: 100, y: 100, width: 1200, height: 800 }

    expect(resolveWindowBounds(windowBounds, [primaryDisplay], primaryDisplay)).toEqual(
      windowBounds
    )
  })

  it('keeps bounds when at least 100x100 pixels are visible', () => {
    const windowBounds = { x: 1750, y: 100, width: 800, height: 800 }

    expect(resolveWindowBounds(windowBounds, [primaryDisplay], primaryDisplay)).toEqual(
      windowBounds
    )
  })

  it('recenters the window when only a thin sliver is visible', () => {
    const windowBounds = { x: 1839, y: -303, width: 800, height: 1084 }

    expect(resolveWindowBounds(windowBounds, [primaryDisplay], primaryDisplay)).toEqual({
      x: 560,
      y: 0,
      width: 800,
      height: 1080,
    })
  })

  it('keeps bounds when the window is visible on a secondary display', () => {
    const secondaryDisplay = { x: 1920, y: 0, width: 1920, height: 1080 }
    const windowBounds = { x: 2300, y: 200, width: 1000, height: 700 }

    expect(
      resolveWindowBounds(
        windowBounds,
        [primaryDisplay, secondaryDisplay],
        primaryDisplay
      )
    ).toEqual(windowBounds)
  })

  it('recenters and resizes oversized off-screen bounds to fit primary display', () => {
    const windowBounds = { x: 4000, y: 1000, width: 2500, height: 1600 }

    expect(resolveWindowBounds(windowBounds, [primaryDisplay], primaryDisplay)).toEqual({
      x: 0,
      y: 0,
      width: 1920,
      height: 1080,
    })
  })
})
