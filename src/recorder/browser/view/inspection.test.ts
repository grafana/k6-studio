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

import { attachInspectionDetection } from './inspection'

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
