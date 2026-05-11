import { describe, expect, it } from 'vitest'

import { BrowserEvent, ElementSelector } from '@/schemas/recording'

import {
  convertEventsToActions,
  toLocatorOptions,
} from './convertEventsToActions'

describe('toLocatorOptions', () => {
  it('populates css locator from selector', () => {
    const selector: ElementSelector = { css: 'div.foo' }
    const result = toLocatorOptions(selector)
    expect(result.values.css).toEqual({ type: 'css', selector: 'div.foo' })
    expect(result.current).toBe('css')
  })

  it('populates role locator and selects it as current', () => {
    const selector: ElementSelector = {
      css: 'button',
      role: { role: 'button', name: 'Submit' },
    }
    const result = toLocatorOptions(selector)
    expect(result.values.role).toEqual({
      type: 'role',
      role: 'button',
      options: { name: 'Submit' },
    })
    expect(result.current).toBe('role')
  })

  it('populates testid locator when non-empty', () => {
    const selector: ElementSelector = { css: 'div', testId: 'my-component' }
    const result = toLocatorOptions(selector)
    expect(result.values.testid).toEqual({
      type: 'testid',
      testId: 'my-component',
    })
    expect(result.current).toBe('testid')
  })

  it('skips testid when empty string', () => {
    const selector: ElementSelector = { css: 'div', testId: '' }
    const result = toLocatorOptions(selector)
    expect(result.values.testid).toBeUndefined()
    expect(result.current).toBe('css')
  })

  it('populates alt locator when non-empty', () => {
    const selector: ElementSelector = { css: 'img', alt: 'Profile picture' }
    const result = toLocatorOptions(selector)
    expect(result.values.alt).toEqual({ type: 'alt', text: 'Profile picture' })
    expect(result.current).toBe('alt')
  })

  it('populates label locator when non-empty', () => {
    const selector: ElementSelector = { css: 'input', label: 'Username' }
    const result = toLocatorOptions(selector)
    expect(result.values.label).toEqual({ type: 'label', label: 'Username' })
    expect(result.current).toBe('label')
  })

  it('populates placeholder locator when non-empty', () => {
    const selector: ElementSelector = {
      css: 'input',
      placeholder: 'Enter name',
    }
    const result = toLocatorOptions(selector)
    expect(result.values.placeholder).toEqual({
      type: 'placeholder',
      placeholder: 'Enter name',
    })
    expect(result.current).toBe('placeholder')
  })

  it('populates title locator when non-empty', () => {
    const selector: ElementSelector = { css: 'a', title: 'Home link' }
    const result = toLocatorOptions(selector)
    expect(result.values.title).toEqual({ type: 'title', title: 'Home link' })
    expect(result.current).toBe('title')
  })

  it('skips locators with empty or whitespace-only strings', () => {
    const selector: ElementSelector = {
      css: 'div',
      alt: '',
      label: '  ',
      placeholder: '',
      title: '',
      testId: '',
    }
    const result = toLocatorOptions(selector)
    expect(result.values.alt).toBeUndefined()
    expect(result.values.label).toBeUndefined()
    expect(result.values.placeholder).toBeUndefined()
    expect(result.values.title).toBeUndefined()
    expect(result.values.testid).toBeUndefined()
    expect(result.current).toBe('css')
  })

  it('selects current by priority: role > label > alt > placeholder > title > testid > css', () => {
    const selector: ElementSelector = {
      css: 'input',
      role: { role: 'textbox', name: 'Email' },
      label: 'Email',
      alt: 'email icon',
      placeholder: 'Enter email',
      title: 'Email field',
      testId: 'email-input',
    }
    const result = toLocatorOptions(selector)
    expect(result.current).toBe('role')
    expect(Object.keys(result.values)).toHaveLength(7)
  })

  it('falls back through priority when higher-priority locators are missing', () => {
    const selector: ElementSelector = {
      css: 'input',
      placeholder: 'Search',
      testId: 'search-box',
    }
    const result = toLocatorOptions(selector)
    expect(result.current).toBe('placeholder')
  })
})

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

  it('skips assert events', () => {
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
    expect(actions).toHaveLength(0)
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
