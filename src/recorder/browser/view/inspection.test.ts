import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { FrameAgent, installFrameAgent } from '../messaging/frames'

import { attachInspectionDetection, isTopFrameToolActive } from './inspection'

const hover = vi.fn()
const pick = vi.fn()

beforeAll(() => {
  attachInspectionDetection()
})

beforeEach(() => {
  window.__K6_STUDIO_INSPECTION__ = { hover, pick }
})

afterEach(() => {
  hover.mockClear()
  pick.mockClear()
  delete window.__K6_STUDIO_INSPECTION__
  document.body.innerHTML = ''
})

afterAll(() => {
  delete window.__K6_STUDIO_INSPECTION__
})

function dispatch(type: string, target: Element, init: MouseEventInit = {}) {
  target.dispatchEvent(
    new MouseEvent(type, { bubbles: true, composed: true, ...init })
  )
}

describe('attachInspectionDetection', () => {
  it('reports a hovered element to the top frame', () => {
    const button = document.createElement('button')
    document.body.append(button)

    dispatch('mouseover', button)

    expect(hover).toHaveBeenCalledWith(button)
  })

  it('clears the hover when the cursor is over an iframe', () => {
    const iframe = document.createElement('iframe')
    document.body.append(iframe)

    dispatch('mouseover', iframe)

    expect(hover).toHaveBeenCalledWith(null)
  })

  it('picks a clicked element', () => {
    const button = document.createElement('button')
    document.body.append(button)

    dispatch('click', button, { clientX: 5, clientY: 6 })

    expect(pick).toHaveBeenCalledWith(button, 5, 6)
  })

  it('does not pick an iframe element', () => {
    const iframe = document.createElement('iframe')
    document.body.append(iframe)

    dispatch('click', iframe, { clientX: 5, clientY: 6 })

    expect(pick).not.toHaveBeenCalled()
  })
})

describe('isTopFrameToolActive with a frame agent', () => {
  beforeEach(() => {
    // The outer suite's beforeEach installs an inspection bridge; these tests
    // exercise the no-bridge, frame-agent-only path.
    delete window.__K6_STUDIO_INSPECTION__
  })

  afterEach(() => {
    installFrameAgent(null)
  })

  it('is true when the frame agent has received an active tool state', () => {
    installFrameAgent({ isToolActive: true } as unknown as FrameAgent)

    expect(isTopFrameToolActive()).toBe(true)
  })

  it('is false when the frame agent tool state is inactive and no bridge exists', () => {
    installFrameAgent({ isToolActive: false } as unknown as FrameAgent)

    expect(isTopFrameToolActive()).toBe(false)
  })
})
