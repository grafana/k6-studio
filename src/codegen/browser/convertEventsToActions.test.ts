import { describe, expect, it } from 'vitest'

import { LocatorOptions } from '@/schemas/locator'
import { BrowserEvent } from '@/schemas/recording'
import {
  createClickEvent,
  createNavigateToPageEvent,
} from '@/test/factories/browserEvents'
import {
  createProxyData,
  createRequest,
  createResponse,
} from '@/test/factories/proxyData'

import {
  convertEventsToActions,
  convertRecordingToActions,
} from './convertEventsToActions'

function makeTarget(css = 'div.test') {
  return { selectors: { css } }
}

describe('convertEventsToActions', () => {
  it('returns empty array for empty events', () => {
    expect(convertEventsToActions([])).toEqual([])
  })

  it('converts navigate-to-page to page.goto', () => {
    const events: BrowserEvent[] = [
      {
        type: 'navigate-to-page',
        eventId: '1',
        timestamp: 0,
        tab: 'tab1',
        url: 'https://example.com',
        source: 'address-bar',
      },
    ]
    const actions = convertEventsToActions(events)
    expect(actions).toHaveLength(1)
    expect(actions[0]).toMatchObject({
      method: 'page.goto',
      url: 'https://example.com',
    })
  })

  it('skips navigation to non-web urls', () => {
    const events: BrowserEvent[] = [
      {
        type: 'navigate-to-page',
        eventId: '1',
        timestamp: 0,
        tab: 'tab1',
        url: 'chrome://new-tab-page/',
        source: 'address-bar',
      },
    ]
    expect(convertEventsToActions(events)).toEqual([])
  })

  it('skips tab-opened events', () => {
    const events: BrowserEvent[] = [
      {
        type: 'tab-opened',
        eventId: '1',
        timestamp: 0,
        tab: 'tab1',
      },
    ]
    expect(convertEventsToActions(events)).toEqual([])
  })

  it('skips reload of a non-web url', () => {
    const events: BrowserEvent[] = [
      {
        type: 'reload-page',
        eventId: '1',
        timestamp: 0,
        tab: 'tab1',
        url: 'chrome://new-tab-page/',
      },
    ]
    expect(convertEventsToActions(events)).toEqual([])
  })

  it('converts reload-page to page.reload', () => {
    const events: BrowserEvent[] = [
      {
        type: 'reload-page',
        eventId: '1',
        timestamp: 0,
        tab: 'tab1',
        url: 'https://example.com',
      },
    ]
    const actions = convertEventsToActions(events)
    expect(actions).toHaveLength(1)
    expect(actions[0]).toMatchObject({ method: 'page.reload' })
  })

  it('converts click to locator.click with button and modifiers', () => {
    const events: BrowserEvent[] = [
      {
        type: 'click',
        eventId: '1',
        timestamp: 0,
        tab: 'tab1',
        target: makeTarget('button.submit'),
        button: 'right',
        modifiers: { ctrl: true, shift: false, alt: true, meta: false },
      },
    ]
    const actions = convertEventsToActions(events)
    expect(actions).toHaveLength(1)
    expect(actions[0]).toMatchObject({
      method: 'locator.click',
      options: { button: 'right', modifiers: ['Alt', 'Control'] },
    })
  })

  it('converts click with default button and no modifiers without options', () => {
    const events: BrowserEvent[] = [
      {
        type: 'click',
        eventId: '1',
        timestamp: 0,
        tab: 'tab1',
        target: makeTarget(),
        button: 'left',
        modifiers: { ctrl: false, shift: false, alt: false, meta: false },
      },
    ]
    const actions = convertEventsToActions(events)
    expect(actions).toHaveLength(1)
    expect(actions[0]).toMatchObject({ method: 'locator.click' })
    expect((actions[0] as { options?: unknown }).options).toBeUndefined()
  })

  it('converts input-change to locator.fill', () => {
    const events: BrowserEvent[] = [
      {
        type: 'input-change',
        eventId: '1',
        timestamp: 0,
        tab: 'tab1',
        target: makeTarget('input.name'),
        value: 'John',
        sensitive: false,
      },
    ]
    const actions = convertEventsToActions(events)
    expect(actions).toHaveLength(1)
    expect(actions[0]).toMatchObject({ method: 'locator.fill', value: 'John' })
  })

  it('converts check-change (checked=true) to locator.check', () => {
    const events: BrowserEvent[] = [
      {
        type: 'check-change',
        eventId: '1',
        timestamp: 0,
        tab: 'tab1',
        target: makeTarget('input[type=checkbox]'),
        checked: true,
      },
    ]
    const actions = convertEventsToActions(events)
    expect(actions).toHaveLength(1)
    expect(actions[0]).toMatchObject({ method: 'locator.check' })
  })

  it('converts check-change (checked=false) to locator.uncheck', () => {
    const events: BrowserEvent[] = [
      {
        type: 'check-change',
        eventId: '1',
        timestamp: 0,
        tab: 'tab1',
        target: makeTarget('input[type=checkbox]'),
        checked: false,
      },
    ]
    const actions = convertEventsToActions(events)
    expect(actions).toHaveLength(1)
    expect(actions[0]).toMatchObject({ method: 'locator.uncheck' })
  })

  it('converts radio-change to locator.click', () => {
    const events: BrowserEvent[] = [
      {
        type: 'radio-change',
        eventId: '1',
        timestamp: 0,
        tab: 'tab1',
        target: makeTarget('input[type=radio]'),
        name: 'color',
        value: 'red',
      },
    ]
    const actions = convertEventsToActions(events)
    expect(actions).toHaveLength(1)
    expect(actions[0]).toMatchObject({ method: 'locator.click' })
  })

  it('converts select-change to locator.selectOption', () => {
    const events: BrowserEvent[] = [
      {
        type: 'select-change',
        eventId: '1',
        timestamp: 0,
        tab: 'tab1',
        target: makeTarget('select'),
        selected: ['opt1', 'opt2'],
        multiple: true,
      },
    ]
    const actions = convertEventsToActions(events)
    expect(actions).toHaveLength(1)
    expect(actions[0]).toMatchObject({
      method: 'locator.selectOption',
      values: [{ value: 'opt1' }, { value: 'opt2' }],
    })
  })

  it('converts submit-form to locator.click on submitter', () => {
    const events: BrowserEvent[] = [
      {
        type: 'submit-form',
        eventId: '1',
        timestamp: 0,
        tab: 'tab1',
        form: makeTarget('form'),
        submitter: makeTarget('button[type=submit]'),
      },
    ]
    const [action, ...rest] = convertEventsToActions(events) as Array<{
      method: string
      locator?: LocatorOptions
    }>

    expect(rest).toHaveLength(0)
    expect(action?.method).toBe('locator.click')
    expect(action?.locator?.values.css?.selector).toBe('button[type=submit]')
  })

  it('converts wait-for to locator.waitFor with options', () => {
    const events: BrowserEvent[] = [
      {
        type: 'wait-for',
        eventId: '1',
        timestamp: 0,
        tab: 'tab1',
        target: makeTarget('div.loading'),
        options: { state: 'hidden', timeout: 5000 },
      },
    ]
    const actions = convertEventsToActions(events)
    expect(actions).toHaveLength(1)
    expect(actions[0]).toMatchObject({
      method: 'locator.waitFor',
      options: { state: 'hidden', timeout: 5000 },
    })
  })

  it('skips implicit navigate-to-page events', () => {
    const events: BrowserEvent[] = [
      {
        type: 'navigate-to-page',
        eventId: '1',
        timestamp: 0,
        tab: 'tab1',
        url: 'https://example.com/login',
        source: 'implicit',
      },
    ]
    const actions = convertEventsToActions(events)
    expect(actions).toHaveLength(0)
  })

  it('keeps address-bar and history navigate-to-page events', () => {
    const events: BrowserEvent[] = [
      {
        type: 'navigate-to-page',
        eventId: '1',
        timestamp: 0,
        tab: 'tab1',
        url: 'https://example.com',
        source: 'address-bar',
      },
      {
        type: 'navigate-to-page',
        eventId: '2',
        timestamp: 100,
        tab: 'tab1',
        url: 'https://example.com/page',
        source: 'history',
      },
    ]
    const actions = convertEventsToActions(events)
    expect(actions).toHaveLength(2)
  })

  it('sets waitForNavigation on click followed by implicit navigation', () => {
    const events: BrowserEvent[] = [
      {
        type: 'click',
        eventId: '1',
        timestamp: 0,
        tab: 'tab1',
        target: makeTarget('a.link'),
        button: 'left',
        modifiers: { ctrl: false, shift: false, alt: false, meta: false },
      },
      {
        type: 'navigate-to-page',
        eventId: '2',
        timestamp: 100,
        tab: 'tab1',
        url: 'https://example.com/next',
        source: 'implicit',
      },
    ]
    const actions = convertEventsToActions(events)
    expect(actions).toHaveLength(1)
    expect(actions[0]).toMatchObject({
      method: 'locator.click',
      options: { waitForNavigation: true },
    })
  })

  it('sets switchesToNewPage on click followed by tab-opened', () => {
    const events: BrowserEvent[] = [
      {
        type: 'click',
        eventId: '1',
        timestamp: 0,
        tab: 'tab1',
        target: makeTarget('a.link'),
        button: 'left',
        modifiers: { ctrl: false, shift: false, alt: false, meta: false },
      },
      {
        type: 'tab-opened',
        eventId: '2',
        timestamp: 100,
        tab: 'tab2',
      },
      {
        type: 'navigate-to-page',
        eventId: '3',
        timestamp: 200,
        tab: 'tab2',
        url: 'https://example.com/next',
        source: 'implicit',
      },
    ]
    const actions = convertEventsToActions(events)
    expect(actions).toHaveLength(1)
    expect(actions[0]).toMatchObject({
      method: 'locator.click',
      options: { switchesToNewPage: true },
    })
    expect(
      (actions[0] as { options?: { waitForNavigation?: boolean } }).options
        ?.waitForNavigation
    ).toBeUndefined()
  })

  it('does not set waitForNavigation when next navigation is on different tab', () => {
    const events: BrowserEvent[] = [
      {
        type: 'click',
        eventId: '1',
        timestamp: 0,
        tab: 'tab1',
        target: makeTarget('a.link'),
        button: 'left',
        modifiers: { ctrl: false, shift: false, alt: false, meta: false },
      },
      {
        type: 'navigate-to-page',
        eventId: '2',
        timestamp: 100,
        tab: 'tab2',
        url: 'https://example.com/next',
        source: 'implicit',
      },
    ]
    const actions = convertEventsToActions(events)
    expect(actions).toHaveLength(1)
    expect((actions[0] as { options?: unknown }).options).toBeUndefined()
  })

  it('sets waitForNavigation on submit-form followed by implicit navigation', () => {
    const events: BrowserEvent[] = [
      {
        type: 'submit-form',
        eventId: '1',
        timestamp: 0,
        tab: 'tab1',
        form: makeTarget('form'),
        submitter: makeTarget('button[type=submit]'),
      },
      {
        type: 'navigate-to-page',
        eventId: '2',
        timestamp: 100,
        tab: 'tab1',
        url: 'https://example.com/dashboard',
        source: 'implicit',
      },
    ]
    const actions = convertEventsToActions(events)
    expect(actions).toHaveLength(1)
    expect(actions[0]).toMatchObject({
      method: 'locator.click',
      options: { waitForNavigation: true },
    })
  })

  it('converts assert events into matching assertion actions', () => {
    const events: BrowserEvent[] = [
      {
        type: 'assert',
        eventId: '1',
        timestamp: 0,
        tab: 'tab1',
        target: { selectors: { css: 'h1.title' } },
        assertion: {
          type: 'text',
          operation: { type: 'contains', value: 'Welcome' },
        },
      },
    ]
    const actions = convertEventsToActions(events)
    expect(actions).toHaveLength(1)
    expect(actions[0]).toMatchObject({
      method: 'locator.toContainText',
      expected: 'Welcome',
    })
  })

  it('drops assert events that produce no action (indeterminate check)', () => {
    const events: BrowserEvent[] = [
      {
        type: 'assert',
        eventId: '1',
        timestamp: 0,
        tab: 'tab1',
        target: { selectors: { css: 'input[type="checkbox"]' } },
        assertion: {
          type: 'check',
          inputType: 'aria',
          expected: 'indeterminate',
        },
      },
    ]
    const actions = convertEventsToActions(events)
    expect(actions).toEqual([])
  })

  it('inserts a wait before the flagged action', () => {
    const events: BrowserEvent[] = [
      {
        type: 'navigate-to-page',
        eventId: '1',
        timestamp: 0,
        tab: 'tab1',
        url: 'https://example.com',
        source: 'address-bar',
      },
      {
        type: 'click',
        eventId: '2',
        timestamp: 100,
        tab: 'tab1',
        target: makeTarget('button'),
        button: 'left',
        modifiers: { ctrl: false, shift: false, alt: false, meta: false },
      },
    ]
    const actions = convertEventsToActions(events, new Map([['2', 1500]]))
    expect(actions).toHaveLength(3)
    expect(actions[0]).toMatchObject({ method: 'page.goto' })
    expect(actions[1]).toMatchObject({
      method: 'page.waitForTimeout',
      timeout: 1500,
    })
    expect(actions[2]).toMatchObject({ method: 'locator.click' })
  })

  it('leaves actions unchanged when no event id matches', () => {
    const events: BrowserEvent[] = [
      {
        type: 'click',
        eventId: '1',
        timestamp: 0,
        tab: 'tab1',
        target: makeTarget('button'),
        button: 'left',
        modifiers: { ctrl: false, shift: false, alt: false, meta: false },
      },
    ]
    const actions = convertEventsToActions(events, new Map([['other', 1500]]))
    expect(actions).toHaveLength(1)
    expect(actions[0]).toMatchObject({ method: 'locator.click' })
  })

  it('does not insert a wait before an event that converts to nothing', () => {
    const events: BrowserEvent[] = [
      {
        type: 'navigate-to-page',
        eventId: '1',
        timestamp: 0,
        tab: 'tab1',
        url: 'https://example.com/login',
        source: 'implicit',
      },
    ]
    expect(convertEventsToActions(events, new Map([['1', 1500]]))).toEqual([])
  })

  it('preserves event order and generates unique ids', () => {
    const events: BrowserEvent[] = [
      {
        type: 'navigate-to-page',
        eventId: '1',
        timestamp: 0,
        tab: 'tab1',
        url: 'https://example.com',
        source: 'address-bar',
      },
      {
        type: 'click',
        eventId: '2',
        timestamp: 100,
        tab: 'tab1',
        target: makeTarget('button'),
        button: 'left',
        modifiers: { ctrl: false, shift: false, alt: false, meta: false },
      },
      {
        type: 'input-change',
        eventId: '3',
        timestamp: 200,
        tab: 'tab1',
        target: makeTarget('input'),
        value: 'hello',
        sensitive: false,
      },
    ]
    const actions = convertEventsToActions(events)
    expect(actions).toHaveLength(3)
    expect(actions[0]!.method).toBe('page.goto')
    expect(actions[1]!.method).toBe('locator.click')
    expect(actions[2]!.method).toBe('locator.fill')
    const ids = actions.map((action) => action.id)
    expect(new Set(ids).size).toBe(3)
  })
})

describe('convertRecordingToActions', () => {
  it('inserts the waits detected from the recording', () => {
    const events = [
      createNavigateToPageEvent({
        eventId: '1',
        timestamp: 1_000_000,
        url: 'https://example.com/',
      }),
      createClickEvent({ eventId: '2', timestamp: 1_001_000 }),
      createClickEvent({ eventId: '3', timestamp: 1_004_000 }),
    ]
    // A 1s request fired by the first click and waited out by the recording's
    // own pacing before the second click.
    const requests = [
      createProxyData({
        request: createRequest({
          host: 'example.com',
          url: 'https://example.com/data',
          timestampStart: 1001,
          timestampEnd: 1002,
        }),
        response: createResponse(),
      }),
    ]

    const methods = convertRecordingToActions(events, requests).map(
      (action) => action.method
    )

    expect(methods).toEqual([
      'page.goto',
      'locator.click',
      'page.waitForTimeout',
      'locator.click',
    ])
  })
})
