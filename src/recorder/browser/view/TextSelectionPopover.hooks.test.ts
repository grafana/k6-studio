import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import * as layout from '@/utils/dom/layout'

import { FrameAgent, installFrameAgent } from '../messaging/frames'
import { serializeElementChain } from '../serialization'

import {
  buildRemoteSelection,
  useTextSelection,
} from './TextSelectionPopover.hooks'

afterEach(() => {
  document.body.innerHTML = ''
  installFrameAgent(null)
  vi.restoreAllMocks()
})

function fakeRange(commonAncestor: Element): Range {
  return {
    toString: () => 'hello',
    startContainer: commonAncestor,
    getClientRects: () => [],
    getBoundingClientRect: () =>
      ({ top: 0, left: 0, width: 0, height: 0 }) as DOMRect,
  } as unknown as Range
}

describe('buildRemoteSelection', () => {
  it('returns null when the payload has no elements', () => {
    const result = buildRemoteSelection({
      text: 'hello',
      elements: [],
      framePath: null,
      highlights: [],
      bounds: { top: 0, left: 0, width: 0, height: 0 },
      offset: { left: 0, top: 0 },
    })

    expect(result).toBeNull()
  })

  it('builds a remote selection with bounds and highlights finalized once from the payload', () => {
    const div = document.createElement('div')
    document.body.append(div)

    const [state] = serializeElementChain(div)

    if (state === undefined) {
      throw new Error('expected a serialized state')
    }

    const framePath = [{ selectors: { css: 'iframe#a' } }]

    const result = buildRemoteSelection({
      text: 'hello',
      elements: [state],
      framePath,
      highlights: [{ top: 1, left: 2, width: 3, height: 4 }],
      bounds: { top: 10, left: 20, width: 30, height: 40 },
      offset: { left: 5, top: 6 },
    })

    if (result === null) {
      throw new Error('expected a remote selection')
    }

    expect(result.kind).toBe('remote')
    expect(result.text).toBe('hello')
    expect(result.framePath).toBe(framePath)
    expect(result.element.kind).toBe('remote')
    expect(result.element.state).toBe(state)
    expect(result.bounds).toEqual({
      top: 10 + 6 + window.scrollY,
      left: 20 + 5 + window.scrollX,
      width: 30,
      height: 40,
    })
    expect(result.highlights).toEqual([
      {
        top: 1 + 6 + window.scrollY,
        left: 2 + 5 + window.scrollX,
        width: 3,
        height: 4,
      },
    ])
  })
})

describe('useTextSelection', () => {
  it('starts with no selection', () => {
    const { result } = renderHook(() => useTextSelection())

    const [selection] = result.current

    expect(selection).toBeNull()
  })

  it('builds a remote selection from a payload relayed over the frame agent', () => {
    let onTextSelection: ((payload: unknown) => void) | undefined

    installFrameAgent({
      onTextSelection: (listener: (payload: unknown) => void) => {
        onTextSelection = listener
        return () => {}
      },
    } as unknown as FrameAgent)

    const div = document.createElement('div')
    document.body.append(div)

    const [state] = serializeElementChain(div)

    if (state === undefined) {
      throw new Error('expected a serialized state')
    }

    const { result } = renderHook(() => useTextSelection())

    if (onTextSelection === undefined) {
      throw new Error('expected useTextSelection to subscribe')
    }

    act(() => {
      onTextSelection?.({
        text: 'hello',
        elements: [state],
        framePath: null,
        highlights: [],
        bounds: { top: 0, left: 0, width: 0, height: 0 },
        offset: { left: 0, top: 0 },
      })
    })

    const [selection] = result.current

    expect(selection?.kind).toBe('remote')
    expect(selection?.text).toBe('hello')
  })

  it('clears the selection', () => {
    installFrameAgent({
      onTextSelection: () => () => {},
    } as unknown as FrameAgent)

    const div = document.createElement('div')
    document.body.append(div)

    const [state] = serializeElementChain(div)

    if (state === undefined) {
      throw new Error('expected a serialized state')
    }

    const { result } = renderHook(() => useTextSelection())

    act(() => {
      result.current[1]()
    })

    expect(result.current[0]).toBeNull()
  })

  it('does not subscribe to layout-shift re-measuring for a remote selection', () => {
    const observeSpy = vi.spyOn(layout, 'observeWindowsForLayoutShift')

    let onTextSelection: ((payload: unknown) => void) | undefined

    installFrameAgent({
      onTextSelection: (listener: (payload: unknown) => void) => {
        onTextSelection = listener
        return () => {}
      },
    } as unknown as FrameAgent)

    const div = document.createElement('div')
    document.body.append(div)

    const [state] = serializeElementChain(div)

    if (state === undefined) {
      throw new Error('expected a serialized state')
    }

    renderHook(() => useTextSelection())

    act(() => {
      onTextSelection?.({
        text: 'hello',
        elements: [state],
        framePath: null,
        highlights: [],
        bounds: { top: 0, left: 0, width: 0, height: 0 },
        offset: { left: 0, top: 0 },
      })
    })

    expect(observeSpy).not.toHaveBeenCalled()
  })

  it('subscribes to layout-shift re-measuring for a live selection', () => {
    const observeSpy = vi.spyOn(layout, 'observeWindowsForLayoutShift')

    document.body.innerHTML = '<div id="target"></div>'
    const target = document.querySelector('#target')

    if (target === null) {
      throw new Error('expected #target element')
    }

    renderHook(() => useTextSelection())

    act(() => {
      window.__K6_STUDIO_TEXT_SELECTION__?.select(fakeRange(target), target)
    })

    expect(observeSpy).toHaveBeenCalled()
  })
})
