import { screen } from 'electron'
import { describe, expect, it, vi } from 'vitest'

import { isWindowOnScreen } from './window'

vi.mock('electron', () => ({
  app: {
    getPath: vi.fn().mockReturnValue('/tmp'),
  },
  BrowserWindow: vi.fn(),
  screen: {
    getDisplayMatching: vi.fn(),
  },
}))

function mockDisplay(workArea: {
  x: number
  y: number
  width: number
  height: number
}) {
  vi.mocked(screen).getDisplayMatching.mockReturnValue({
    workArea,
  } as Electron.Display)
}

describe('isWindowOnScreen', () => {
  it('returns true when window is fully on-screen', () => {
    mockDisplay({ x: 0, y: 0, width: 1920, height: 1080 })
    expect(isWindowOnScreen({ x: 100, y: 100, width: 1200, height: 800 })).toBe(
      true
    )
  })

  it('returns false when window is completely off-screen', () => {
    mockDisplay({ x: 0, y: 0, width: 1920, height: 1080 })
    expect(
      isWindowOnScreen({ x: 3000, y: 200, width: 1200, height: 800 })
    ).toBe(false)
  })

  it('returns false when window is off-screen with negative coordinates', () => {
    mockDisplay({ x: 0, y: 0, width: 1920, height: 1080 })
    expect(
      isWindowOnScreen({ x: -2500, y: 200, width: 1200, height: 800 })
    ).toBe(false)
  })

  it('returns true when window partially overlaps the display', () => {
    mockDisplay({ x: 0, y: 0, width: 1920, height: 1080 })
    expect(
      isWindowOnScreen({ x: -200, y: -100, width: 1200, height: 800 })
    ).toBe(true)
  })

  it('returns true for display with non-zero origin', () => {
    mockDisplay({ x: 1920, y: 0, width: 1920, height: 1080 })
    expect(
      isWindowOnScreen({ x: 2000, y: 100, width: 1200, height: 800 })
    ).toBe(true)
  })
})
