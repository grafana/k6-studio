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

import {
  ElementPickPayload,
  FrameAgent,
  installFrameAgent,
  TextSelectionPayload,
} from '../messaging/frames'
import { serializeElementChain, serializeElementState } from '../serialization'

import * as childOverlays from './childOverlays'
import {
  attachInspectionDetection,
  attachTextSelectionDetection,
  isTopFrameToolActive,
} from './inspection'

vi.mock('./childOverlays', () => ({
  showChildOverlays: vi.fn(),
  clearChildOverlays: vi.fn(),
}))

const showChildOverlays = vi.mocked(childOverlays.showChildOverlays)
const clearChildOverlays = vi.mocked(childOverlays.clearChildOverlays)

const hover = vi.fn()
const pick = vi.fn()
const sendElementPick =
  vi.fn<(payload: Omit<ElementPickPayload, 'offset'>) => void>()
const sendTextSelection =
  vi.fn<(payload: Omit<TextSelectionPayload, 'offset'>) => void>()

/** Flushes the microtasks in `getOwnFramePath`'s resolution chain. */
function flush(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

function installActiveFrameAgent() {
  installFrameAgent({
    isToolActive: true,
    sendElementPick,
    sendTextSelection,
  } as unknown as FrameAgent)
}

beforeAll(() => {
  attachInspectionDetection()
  attachTextSelectionDetection()
})

beforeEach(() => {
  window.__K6_STUDIO_INSPECTION__ = { hover, pick }
})

afterEach(() => {
  hover.mockClear()
  pick.mockClear()
  sendElementPick.mockClear()
  sendTextSelection.mockClear()
  showChildOverlays.mockClear()
  clearChildOverlays.mockClear()
  delete window.__K6_STUDIO_INSPECTION__
  installFrameAgent(null)
  document.body.innerHTML = ''
})

afterAll(() => {
  delete window.__K6_STUDIO_INSPECTION__
})

function dispatch(type: string, target: Element, init: MouseEventInit = {}) {
  target.dispatchEvent(
    // Real clicks are cancelable; without it, jsdom's label activation
    // behavior forwards a click to the wrapped control even after
    // `preventDefault()`, since jsdom only honors that on cancelable events.
    new MouseEvent(type, {
      bubbles: true,
      composed: true,
      cancelable: true,
      ...init,
    })
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

describe('attachInspectionDetection with no top-frame bridge', () => {
  beforeEach(() => {
    // The outer suite's beforeEach installs an inspection bridge; these tests
    // exercise the cross-origin path where the bridge is unreachable.
    delete window.__K6_STUDIO_INSPECTION__
  })

  afterEach(() => {
    installFrameAgent(null)
  })

  it('prevents the default click action when the tool is active in an ancestor frame', async () => {
    installActiveFrameAgent()

    const button = document.createElement('button')
    document.body.append(button)

    const event = new MouseEvent('click', {
      bubbles: true,
      composed: true,
      cancelable: true,
    })
    button.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
    expect(pick).not.toHaveBeenCalled()

    // The swallowed click also relays a serialized pick asynchronously; flush
    // it here so the pending send doesn't resolve during a later test.
    await flush()
  })

  it('does not prevent the default click action when no frame agent is installed', () => {
    const button = document.createElement('button')
    document.body.append(button)

    const event = new MouseEvent('click', {
      bubbles: true,
      composed: true,
      cancelable: true,
    })
    button.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(false)
    expect(pick).not.toHaveBeenCalled()
  })

  it('does not prevent the default click action when the frame agent tool is inactive', () => {
    installFrameAgent({ isToolActive: false } as unknown as FrameAgent)

    const button = document.createElement('button')
    document.body.append(button)

    const event = new MouseEvent('click', {
      bubbles: true,
      composed: true,
      cancelable: true,
    })
    button.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(false)
    expect(pick).not.toHaveBeenCalled()
  })
})

describe('attachInspectionDetection with no top-frame bridge and an active frame agent', () => {
  beforeEach(() => {
    // The outer suite's beforeEach installs an inspection bridge; these tests
    // exercise the cross-origin path where the bridge is unreachable but the
    // frame agent reports the tool as active.
    delete window.__K6_STUDIO_INSPECTION__
    installActiveFrameAgent()
  })

  it('draws a local hover overlay for the hovered element', () => {
    const button = document.createElement('button')
    document.body.append(button)

    dispatch('mouseover', button)

    expect(showChildOverlays).toHaveBeenCalledWith(
      [expect.objectContaining({ top: 0, left: 0, width: 0, height: 0 })],
      { kind: 'hover' }
    )
    expect(clearChildOverlays).not.toHaveBeenCalled()
  })

  it('clears the hover overlay instead of drawing one over an iframe', () => {
    const iframe = document.createElement('iframe')
    document.body.append(iframe)

    dispatch('mouseover', iframe)

    expect(clearChildOverlays).toHaveBeenCalledWith({ kind: 'hover' })
    expect(showChildOverlays).not.toHaveBeenCalled()
  })

  it('clears the hover overlay on mouseover once the tool is no longer active', () => {
    installFrameAgent({ isToolActive: false } as unknown as FrameAgent)

    const button = document.createElement('button')
    document.body.append(button)

    dispatch('mouseover', button)

    expect(clearChildOverlays).toHaveBeenCalledWith({ kind: 'hover' })
    expect(showChildOverlays).not.toHaveBeenCalled()
  })

  it('sends a serialized pick for a label-wrapped checkbox and clears the hover overlay', async () => {
    const label = document.createElement('label')
    label.id = 'label'
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.id = 'checkbox'
    checkbox.checked = true
    label.append(checkbox, document.createTextNode('Accept'))
    document.body.append(label)

    dispatch('click', label, { clientX: 5, clientY: 6 })

    await flush()

    expect(clearChildOverlays).toHaveBeenCalledWith({ kind: 'hover' })
    expect(sendElementPick).toHaveBeenCalledTimes(1)

    const payload = sendElementPick.mock.calls[0]![0]

    expect(payload.elements.map((state) => state.target.selectors.css)).toEqual(
      serializeElementChain(label).map((state) => state.target.selectors.css)
    )
    expect(payload.associatedControl).toEqual(serializeElementState(checkbox))
    expect(payload.position).toEqual({ left: 5, top: 6 })
    expect(payload.framePath).toEqual([])
  })

  it('does not pick an iframe element', async () => {
    const iframe = document.createElement('iframe')
    document.body.append(iframe)

    dispatch('click', iframe, { clientX: 5, clientY: 6 })

    await flush()

    expect(sendElementPick).not.toHaveBeenCalled()
  })

  it('does not send a pick when the tool is not active', async () => {
    installFrameAgent({ isToolActive: false } as unknown as FrameAgent)

    const button = document.createElement('button')
    document.body.append(button)

    dispatch('click', button, { clientX: 5, clientY: 6 })

    await flush()

    expect(sendElementPick).not.toHaveBeenCalled()
  })

  it('does not send a pick when the top-frame bridge is reachable', async () => {
    window.__K6_STUDIO_INSPECTION__ = { hover, pick }

    const button = document.createElement('button')
    document.body.append(button)

    dispatch('click', button, { clientX: 5, clientY: 6 })

    await flush()

    expect(pick).toHaveBeenCalledWith(button, 5, 6)
    expect(sendElementPick).not.toHaveBeenCalled()
  })

  describe('when top-window scroll access throws like a cross-origin frame', () => {
    // In a real cross-origin frame, reading `scrollX`/`scrollY` on the top
    // WindowProxy throws a SecurityError. jsdom neither enforces cross-origin
    // access nor allows redefining `window.top` (non-configurable), but in
    // this environment `window.top === window`, so making `window`'s own
    // scroll accessors throw puts the SecurityError at the exact property
    // read the top-scroll lookup performs.
    const scrollDescriptors = ['scrollX', 'scrollY'].map(
      (property) =>
        [property, Object.getOwnPropertyDescriptor(window, property)] as const
    )

    beforeEach(() => {
      scrollDescriptors.forEach(([property]) => {
        Object.defineProperty(window, property, {
          configurable: true,
          get() {
            throw new DOMException('cross-origin', 'SecurityError')
          },
        })
      })
    })

    afterEach(() => {
      scrollDescriptors.forEach(([property, descriptor]) => {
        if (descriptor !== undefined) {
          Object.defineProperty(window, property, descriptor)
        }
      })
    })

    it('still sends a serialized pick with the associated control', async () => {
      const label = document.createElement('label')
      label.id = 'label'
      const checkbox = document.createElement('input')
      checkbox.type = 'checkbox'
      checkbox.id = 'checkbox'
      checkbox.checked = true
      label.append(checkbox, document.createTextNode('Accept'))
      document.body.append(label)

      dispatch('click', label, { clientX: 5, clientY: 6 })

      await flush()

      expect(sendElementPick).toHaveBeenCalledTimes(1)

      const payload = sendElementPick.mock.calls[0]![0]

      expect(payload.associatedControl).toEqual(serializeElementState(checkbox))
    })
  })
})

describe('attachTextSelectionDetection', () => {
  function select(range: Range) {
    const selection = window.getSelection()

    selection?.removeAllRanges()
    selection?.addRange(range)
  }

  function triggerSelection() {
    document.dispatchEvent(new Event('selectstart'))
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
  }

  afterEach(() => {
    delete window.__K6_STUDIO_TEXT_SELECTION__
    window.getSelection()?.removeAllRanges()
  })

  it('reports a selection to the top frame through the bridge when it is reachable', () => {
    const bridgeSelect = vi.fn()
    window.__K6_STUDIO_TEXT_SELECTION__ = { select: bridgeSelect }

    const paragraph = document.createElement('p')
    paragraph.textContent = 'Hello world'
    document.body.append(paragraph)

    const range = document.createRange()
    range.selectNodeContents(paragraph)
    select(range)

    triggerSelection()

    expect(bridgeSelect).toHaveBeenCalledWith(range, paragraph)
    expect(sendTextSelection).not.toHaveBeenCalled()
  })

  describe('with no top-frame bridge and an active frame agent', () => {
    beforeEach(() => {
      delete window.__K6_STUDIO_INSPECTION__
      installActiveFrameAgent()
    })

    it('sends a serialized text selection', async () => {
      const paragraph = document.createElement('p')
      paragraph.id = 'paragraph'
      paragraph.textContent = 'Hello world'
      document.body.append(paragraph)

      const range = document.createRange()
      range.selectNodeContents(paragraph)

      // jsdom doesn't compute layout, so `Range` has no geometry methods of
      // its own; stub them the way `serializeElementState`'s own tests stub
      // `getBoundingClientRect` on an element.
      const highlightRect = { top: 1, left: 2, width: 3, height: 4 } as DOMRect
      range.getClientRects = () => [highlightRect] as unknown as DOMRectList
      range.getBoundingClientRect = () =>
        ({ top: 5, left: 6, width: 7, height: 8 }) as DOMRect

      select(range)

      triggerSelection()

      await flush()

      expect(sendTextSelection).toHaveBeenCalledTimes(1)

      const payload = sendTextSelection.mock.calls[0]![0]

      expect(payload.text).toBe('Hello world')
      expect(
        payload.elements.map((state) => state.target.selectors.css)
      ).toEqual(
        serializeElementChain(paragraph).map(
          (state) => state.target.selectors.css
        )
      )
      expect(payload.framePath).toEqual([])
      expect(payload.highlights).toEqual([
        { top: 1, left: 2, width: 3, height: 4 },
      ])
      expect(payload.bounds).toEqual({ top: 5, left: 6, width: 7, height: 8 })
    })

    it('does not send anything when there is no active selection', async () => {
      triggerSelection()

      await flush()

      expect(sendTextSelection).not.toHaveBeenCalled()
    })

    it('does not send anything when the tool is not active', async () => {
      installFrameAgent({ isToolActive: false } as unknown as FrameAgent)

      const paragraph = document.createElement('p')
      paragraph.textContent = 'Hello world'
      document.body.append(paragraph)

      const range = document.createRange()
      range.selectNodeContents(paragraph)
      select(range)

      triggerSelection()

      await flush()

      expect(sendTextSelection).not.toHaveBeenCalled()
    })
  })
})
