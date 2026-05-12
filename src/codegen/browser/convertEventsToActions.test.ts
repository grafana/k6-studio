import { describe, expect, it } from 'vitest'

import { BrowserEvent } from '@/schemas/recording'

import { convertEventsToActions } from './convertEventsToActions'

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
    const actions = convertEventsToActions(events)
    expect(actions).toHaveLength(1)
    expect(actions[0]).toMatchObject({ method: 'locator.click' })
    expect(
      (actions[0] as { locator: { values: { css: { selector: string } } } })
        .locator.values.css?.selector
    ).toBe('button[type=submit]')
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

  it('converts assert visibility events to locator.toBeVisible', () => {
    const events: BrowserEvent[] = [
      {
        type: 'assert',
        eventId: '1',
        timestamp: 0,
        tab: 'tab1',
        target: makeTarget(),
        assertion: { type: 'visibility', visible: true },
      },
    ]
    const actions = convertEventsToActions(events)
    expect(actions).toHaveLength(1)
    expect(actions[0]).toMatchObject({
      method: 'locator.toBeVisible',
      visible: true,
    })
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
