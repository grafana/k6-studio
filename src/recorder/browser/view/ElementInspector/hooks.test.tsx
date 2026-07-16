import { act, renderHook } from '@testing-library/react'
import { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { BrowserExtensionClient } from '@/recorder/browser/messaging'
import { serializeElementChain } from '@/recorder/browser/serialization'
import { cssLocatorOptions } from '@/schemas/locator'
import { BrowserEventTarget } from '@/schemas/recording'

import { StudioClientProvider } from '../StudioClientProvider'

import { usePinnedElement, useElementHighlight } from './hooks'
import {
  RemoteTrackedElement,
  toRemoteTrackedElement,
  toTrackedElement,
} from './utils'

const frameTarget = (css: string): BrowserEventTarget => ({
  selectors: { css },
})

afterEach(() => {
  document.body.innerHTML = ''
})

describe('usePinnedElement with a live element', () => {
  it('starts with nothing pinned', () => {
    const { result } = renderHook(() => usePinnedElement())

    expect(result.current.pinned).toBeNull()
    expect(result.current.selected).toBeNull()
    expect(result.current.expand).toBeUndefined()
    expect(result.current.contract).toBeUndefined()
  })

  it('pins the given element as both pinned and selected', () => {
    const div = document.createElement('div')
    document.body.append(div)
    const live = toTrackedElement(div)

    const { result } = renderHook(() => usePinnedElement())

    act(() => {
      result.current.pin(live)
    })

    expect(result.current.pinned).toBe(live)
    expect(result.current.selected).toBe(live)
  })

  it('expands to the parent element and contracts back', () => {
    document.body.innerHTML = '<div id="outer"><div id="inner"></div></div>'
    const inner = document.querySelector('#inner')
    const outer = document.querySelector('#outer')

    if (inner === null || outer === null) {
      throw new Error('expected inner and outer elements')
    }

    const { result } = renderHook(() => usePinnedElement())

    act(() => {
      result.current.pin(toTrackedElement(inner))
    })

    expect(result.current.expand).toBeDefined()

    act(() => {
      result.current.expand?.()
    })

    expect(result.current.selected?.element).toBe(outer)
    expect(result.current.pinned?.element).toBe(inner)
    expect(result.current.contract).toBeDefined()

    act(() => {
      result.current.contract?.()
    })

    expect(result.current.selected?.element).toBe(inner)
    expect(result.current.contract).toBeUndefined()
  })

  it('cannot expand past the document element boundary', () => {
    document.body.innerHTML = '<div id="only"></div>'
    const only = document.querySelector('#only')

    if (only === null) {
      throw new Error('expected #only element')
    }

    const { result } = renderHook(() => usePinnedElement())

    act(() => {
      result.current.pin(toTrackedElement(only))
    })

    act(() => {
      result.current.expand?.()
    })

    expect(result.current.selected?.element).toBe(document.body)
    expect(result.current.expand).toBeUndefined()
  })

  it('unpin clears the stack', () => {
    const div = document.createElement('div')
    document.body.append(div)

    const { result } = renderHook(() => usePinnedElement())

    act(() => {
      result.current.pin(toTrackedElement(div))
    })

    act(() => {
      result.current.unpin()
    })

    expect(result.current.pinned).toBeNull()
    expect(result.current.selected).toBeNull()
  })
})

describe('usePinnedElement with a remote element', () => {
  it('expands into the next ancestor and contracts back', () => {
    document.body.innerHTML =
      '<div id="outer"><div id="middle"><div id="inner"></div></div></div>'
    const inner = document.querySelector('#inner')

    if (inner === null) {
      throw new Error('expected #inner element')
    }

    const chain = serializeElementChain(inner)
    const [innerState, middleState] = chain

    if (innerState === undefined || middleState === undefined) {
      throw new Error('expected inner and middle states')
    }

    const initial = toRemoteTrackedElement(innerState, chain.slice(1), null, {
      left: 0,
      top: 0,
    })

    const { result } = renderHook(() =>
      usePinnedElement<RemoteTrackedElement>()
    )

    act(() => {
      result.current.pin(initial)
    })

    expect(result.current.expand).toBeDefined()

    act(() => {
      result.current.expand?.()
    })

    expect(result.current.selected?.state).toBe(middleState)
    expect(result.current.pinned?.state).toBe(innerState)

    act(() => {
      result.current.contract?.()
    })

    expect(result.current.selected?.state).toBe(innerState)
  })

  it('cannot expand once there are no ancestors left', () => {
    document.body.innerHTML = '<div id="only"></div>'
    const only = document.querySelector('#only')

    if (only === null) {
      throw new Error('expected #only element')
    }

    const [state] = serializeElementChain(only)

    if (state === undefined) {
      throw new Error('expected a serialized state')
    }

    const initial = toRemoteTrackedElement(state, [], null, {
      left: 0,
      top: 0,
    })

    const { result } = renderHook(() =>
      usePinnedElement<RemoteTrackedElement>()
    )

    act(() => {
      result.current.pin(initial)
    })

    expect(result.current.expand).toBeUndefined()
  })
})

describe('useElementHighlight', () => {
  function createClient() {
    const client = new BrowserExtensionClient('test')
    const send = vi.spyOn(client, 'send').mockImplementation(() => {})

    function wrapper({ children }: { children: ReactNode }) {
      return (
        <StudioClientProvider client={client}>{children}</StudioClientProvider>
      )
    }

    return { client, send, wrapper }
  }

  it('sends a css locator with no frames for a top-frame live element', () => {
    document.body.innerHTML = '<button id="target">Go</button>'
    const target = document.querySelector('#target')

    if (target === null) {
      throw new Error('expected #target element')
    }

    const live = toTrackedElement(target)
    const { send, wrapper } = createClient()

    renderHook(() => useElementHighlight(live), { wrapper })

    expect(send).toHaveBeenCalledWith({
      type: 'highlight-elements',
      locator: { type: 'css', selector: live.target.selectors.css },
      frames: undefined,
    })
  })

  it('sends frames mapped from the frame path for a remote element', () => {
    const div = document.createElement('div')
    document.body.append(div)

    const [state] = serializeElementChain(div)

    if (state === undefined) {
      throw new Error('expected a serialized state')
    }

    const remote = toRemoteTrackedElement(
      state,
      [],
      [frameTarget('iframe#a')],
      { left: 0, top: 0 }
    )
    const { send, wrapper } = createClient()

    renderHook(() => useElementHighlight(remote), { wrapper })

    expect(send).toHaveBeenCalledWith({
      type: 'highlight-elements',
      locator: { type: 'css', selector: state.target.selectors.css },
      frames: [cssLocatorOptions('iframe#a')],
    })
  })

  it('sends undefined frames when the remote frame path is null', () => {
    const div = document.createElement('div')
    document.body.append(div)

    const [state] = serializeElementChain(div)

    if (state === undefined) {
      throw new Error('expected a serialized state')
    }

    const remote = toRemoteTrackedElement(state, [], null, {
      left: 0,
      top: 0,
    })
    const { send, wrapper } = createClient()

    renderHook(() => useElementHighlight(remote), { wrapper })

    expect(send).toHaveBeenCalledWith({
      type: 'highlight-elements',
      locator: { type: 'css', selector: state.target.selectors.css },
      frames: undefined,
    })
  })

  it('sends a null locator when there is no element', () => {
    const { send, wrapper } = createClient()

    renderHook(() => useElementHighlight(null), { wrapper })

    expect(send).toHaveBeenCalledWith({
      type: 'highlight-elements',
      locator: null,
      frames: undefined,
    })
  })

  it('sends a null locator on unmount', () => {
    const div = document.createElement('div')
    document.body.append(div)
    const live = toTrackedElement(div)

    const { send, wrapper } = createClient()
    const { unmount } = renderHook(() => useElementHighlight(live), {
      wrapper,
    })

    send.mockClear()
    unmount()

    expect(send).toHaveBeenCalledWith({
      type: 'highlight-elements',
      locator: null,
    })
  })
})
