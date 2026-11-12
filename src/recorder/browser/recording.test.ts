import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { BrowserEvent } from '@/schemas/recording'

import { BrowserExtensionClient } from './messaging'
import { startRecording } from './recording'
import { DEFAULT_SETTINGS, SettingsStorage } from './view/SettingsProvider'

vi.mock('@/utils/dom/selectors', () => ({
  getElementDetails: (element: Element) => ({
    selectors: {
      css: element.id ? `#${element.id}` : element.tagName.toLowerCase(),
    },
    aria: { roles: [], labels: [] },
  }),
}))

function dispatchPointerEvent(
  target: Element,
  type: 'pointerdown' | 'pointerup' | 'pointercancel',
  init: MouseEventInit & { pointerId?: number } = {}
) {
  const event = new MouseEvent(type, {
    bubbles: true,
    button: 0,
    clientX: 10,
    clientY: 10,
    composed: true,
    ...init,
  })

  Object.defineProperties(event, {
    isPrimary: { value: true },
    pointerId: { value: init.pointerId ?? 1 },
  })

  target.dispatchEvent(event)
}

function dispatchPointerClick(target: Element, init: MouseEventInit = {}) {
  target.dispatchEvent(
    new MouseEvent('click', {
      bubbles: true,
      button: 0,
      clientX: 10,
      clientY: 10,
      composed: true,
      detail: 1,
      ...init,
    })
  )
}

const settings: SettingsStorage = {
  getCurrent: () => ({ ...DEFAULT_SETTINGS, clickRecordingMode: 'any' }),
  load: () => Promise.resolve(DEFAULT_SETTINGS),
  save: () => Promise.resolve(),
  onUpdate: () => {},
}

describe('click recording', () => {
  let client: BrowserExtensionClient
  let disposeRecording: () => void
  let events: BrowserEvent[]

  beforeEach(() => {
    document.body.innerHTML = ''
    document.body.style.pointerEvents = ''
    events = []
    client = new BrowserExtensionClient('recording-test')
    client.on('record-events', ({ data }) => events.push(...data.events))
    disposeRecording = startRecording(client, settings)
  })

  afterEach(() => {
    disposeRecording()
    client.dispose()
    vi.useRealTimers()
    document.body.innerHTML = ''
    document.body.style.pointerEvents = ''
  })

  it('records the pointerdown target when opening a Radix-style overlay retargets the click', () => {
    document.body.innerHTML = '<button id="trigger">Open</button>'
    const trigger = document.querySelector('#trigger')!

    trigger.addEventListener('pointerdown', () => {
      document.body.style.pointerEvents = 'none'
    })

    dispatchPointerEvent(trigger, 'pointerdown')
    dispatchPointerEvent(document.body, 'pointerup')
    dispatchPointerClick(document.body)

    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({
      type: 'click',
      target: { selectors: { css: '#trigger' } },
    })
  })

  it('preserves programmatic activation', () => {
    document.body.innerHTML = '<button id="programmatic">Run</button>'
    const programmatic =
      document.querySelector<HTMLButtonElement>('#programmatic')!

    programmatic.click()

    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({
      type: 'click',
      target: { selectors: { css: '#programmatic' } },
    })
  })

  it('preserves programmatic clicks during an active pointer sequence', () => {
    document.body.innerHTML = `
      <button id="pointer">Pointer</button>
      <button id="programmatic">Programmatic</button>
    `
    const pointer = document.querySelector('#pointer')!
    const programmatic =
      document.querySelector<HTMLButtonElement>('#programmatic')!

    dispatchPointerEvent(pointer, 'pointerdown')
    programmatic.click()

    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({
      type: 'click',
      target: { selectors: { css: '#programmatic' } },
    })
  })

  it('preserves the browser click target after dragging and releasing outside', () => {
    document.body.innerHTML = '<button id="drag">Drag</button>'
    const drag = document.querySelector('#drag')!

    dispatchPointerEvent(drag, 'pointerdown')
    dispatchPointerEvent(document.body, 'pointerup', { clientX: 100 })
    dispatchPointerClick(document.body, { clientX: 100 })

    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({
      type: 'click',
      target: { selectors: { css: 'body' } },
    })
  })

  it('does not recover a pointer target after pointercancel', () => {
    document.body.innerHTML = '<button id="cancelled">Cancel</button>'
    const cancelled = document.querySelector('#cancelled')!

    dispatchPointerEvent(cancelled, 'pointerdown')
    document.body.style.pointerEvents = 'none'
    dispatchPointerEvent(cancelled, 'pointercancel')
    dispatchPointerClick(document.body)

    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({
      type: 'click',
      target: { selectors: { css: 'body' } },
    })
  })

  it('expires a pointer sequence that produces no click', () => {
    vi.useFakeTimers()
    document.body.innerHTML = '<button id="expired">Expire</button>'
    const expired = document.querySelector('#expired')!

    dispatchPointerEvent(expired, 'pointerdown')
    document.body.style.pointerEvents = 'none'
    dispatchPointerEvent(expired, 'pointerup')
    vi.runAllTimers()
    dispatchPointerClick(document.body)

    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({
      type: 'click',
      target: { selectors: { css: 'body' } },
    })

    vi.useRealTimers()
  })

  it('does not expire the active pointer after another pointer is released', () => {
    vi.useFakeTimers()
    document.body.innerHTML = '<button id="active">Active</button>'
    const active = document.querySelector('#active')!

    dispatchPointerEvent(active, 'pointerdown', { pointerId: 1 })
    document.body.style.pointerEvents = 'none'
    dispatchPointerEvent(document.body, 'pointerup', { pointerId: 2 })
    vi.runAllTimers()
    dispatchPointerClick(document.body)

    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({
      type: 'click',
      target: { selectors: { css: '#active' } },
    })

    vi.useRealTimers()
  })

  it('does not recover a disconnected pointer target', () => {
    document.body.innerHTML = '<button id="removed">Remove</button>'
    const removed = document.querySelector('#removed')!

    dispatchPointerEvent(removed, 'pointerdown')
    document.body.style.pointerEvents = 'none'
    removed.remove()
    dispatchPointerClick(document.body)

    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({
      type: 'click',
      target: { selectors: { css: 'body' } },
    })
  })

  it('keeps form submit de-duplication for ordinary pointer clicks', () => {
    document.body.innerHTML = `
      <form id="form">
        <button id="submit" type="submit">Submit</button>
      </form>
    `
    const form = document.querySelector<HTMLFormElement>('#form')!
    const submit = document.querySelector<HTMLButtonElement>('#submit')!
    form.addEventListener('submit', (event) => event.preventDefault())

    dispatchPointerEvent(submit, 'pointerdown')
    dispatchPointerEvent(submit, 'pointerup')
    dispatchPointerClick(submit)
    form.dispatchEvent(
      new SubmitEvent('submit', {
        bubbles: true,
        cancelable: true,
        submitter: submit,
      })
    )

    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({
      type: 'click',
      target: { selectors: { css: '#submit' } },
    })
  })
})
