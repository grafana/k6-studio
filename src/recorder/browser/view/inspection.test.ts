import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  attachInspectionDetection,
  attachTextSelectionDetection,
} from './inspection'

const hover = vi.fn()
const pick = vi.fn()
const select = vi.fn()

let disposeInspection: () => void
let disposeTextSelection: () => void

beforeEach(() => {
  disposeInspection = attachInspectionDetection()
  disposeTextSelection = attachTextSelectionDetection()

  window.__K6_STUDIO_INSPECTION__ = { hover, pick }
  window.__K6_STUDIO_TEXT_SELECTION__ = { select }
})

afterEach(() => {
  // Disposing twice is safe, so tests that dispose early don't need a guard.
  disposeInspection()
  disposeTextSelection()

  hover.mockClear()
  pick.mockClear()
  select.mockClear()

  delete window.__K6_STUDIO_INSPECTION__
  delete window.__K6_STUDIO_TEXT_SELECTION__

  document.getSelection()?.removeAllRanges()
  document.body.innerHTML = ''
})

function dispatch(type: string, target: Element, init: MouseEventInit = {}) {
  target.dispatchEvent(
    new MouseEvent(type, { bubbles: true, composed: true, ...init })
  )
}

function selectContents(element: Element) {
  const range = document.createRange()
  range.selectNodeContents(element)

  const selection = document.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(range)

  return range
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

  it('stops reporting once disposed', () => {
    const button = document.createElement('button')
    document.body.append(button)

    disposeInspection()

    dispatch('mouseover', button)

    expect(hover).not.toHaveBeenCalled()
  })
})

describe('attachTextSelectionDetection', () => {
  it('reports a text selection to the top frame', () => {
    const paragraph = document.createElement('p')
    paragraph.textContent = 'selected text'
    document.body.append(paragraph)

    dispatch('selectstart', paragraph)

    const range = selectContents(paragraph)

    dispatch('mouseup', paragraph)

    expect(select).toHaveBeenCalledWith(range, paragraph)
  })

  it('stops reporting once disposed', () => {
    const paragraph = document.createElement('p')
    paragraph.textContent = 'selected text'
    document.body.append(paragraph)

    disposeTextSelection()

    dispatch('selectstart', paragraph)

    selectContents(paragraph)

    dispatch('mouseup', paragraph)

    expect(select).not.toHaveBeenCalled()
  })
})
