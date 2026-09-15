import { describe, expect, it } from 'vitest'

import { BrowserEventTarget, ElementSelector } from '@/schemas/recording'

import { toElementLocatorOptions } from './locator'

function createBrowserEventTarget(
  selectors: ElementSelector
): BrowserEventTarget {
  return {
    selectors,
  }
}

describe('toElementLocatorOptions', () => {
  it('populates css locator from selector', () => {
    const selector = createBrowserEventTarget({ css: 'div.foo' })
    const result = toElementLocatorOptions(selector)
    expect(result.values.css).toEqual({ type: 'css', selector: 'div.foo' })
    expect(result.current).toBe('css')
  })

  it('populates role locator and selects it as current', () => {
    const selector = createBrowserEventTarget({
      css: 'button',
      role: { role: 'button', name: 'Submit' },
    })

    const result = toElementLocatorOptions(selector)
    expect(result.values.role).toEqual({
      type: 'role',
      role: 'button',
      options: { name: 'Submit', exact: true },
    })
    expect(result.current).toBe('role')
  })

  it('populates testid locator when non-empty', () => {
    const selector = createBrowserEventTarget({
      css: 'div',
      testId: 'my-component',
    })
    const result = toElementLocatorOptions(selector)
    expect(result.values.testid).toEqual({
      type: 'testid',
      testId: 'my-component',
    })
    expect(result.current).toBe('testid')
  })

  it('skips testid when empty string', () => {
    const selector = createBrowserEventTarget({ css: 'div', testId: '' })
    const result = toElementLocatorOptions(selector)
    expect(result.values.testid).toBeUndefined()
    expect(result.current).toBe('css')
  })

  it('populates alt locator when non-empty', () => {
    const selector = createBrowserEventTarget({
      css: 'img',
      alt: 'Profile picture',
    })
    const result = toElementLocatorOptions(selector)
    expect(result.values.alt).toEqual({
      type: 'alt',
      text: 'Profile picture',
      options: { exact: true },
    })
    expect(result.current).toBe('alt')
  })

  it('populates label locator when non-empty', () => {
    const selector = createBrowserEventTarget({
      css: 'input',
      label: 'Username',
    })
    const result = toElementLocatorOptions(selector)
    expect(result.values.label).toEqual({
      type: 'label',
      label: 'Username',
      options: { exact: true },
    })
    expect(result.current).toBe('label')
  })

  it('populates placeholder locator when non-empty', () => {
    const selector = createBrowserEventTarget({
      css: 'input',
      placeholder: 'Enter name',
    })
    const result = toElementLocatorOptions(selector)
    expect(result.values.placeholder).toEqual({
      type: 'placeholder',
      placeholder: 'Enter name',
      options: { exact: true },
    })
    expect(result.current).toBe('placeholder')
  })

  it('populates title locator when non-empty', () => {
    const selector = createBrowserEventTarget({ css: 'a', title: 'Home link' })
    const result = toElementLocatorOptions(selector)
    expect(result.values.title).toEqual({
      type: 'title',
      title: 'Home link',
      options: { exact: true },
    })
    expect(result.current).toBe('title')
  })

  it('skips locators with empty or whitespace-only strings', () => {
    const selector = createBrowserEventTarget({
      css: 'div',
      alt: '',
      label: '  ',
      placeholder: '',
      title: '',
      testId: '',
    })
    const result = toElementLocatorOptions(selector)
    expect(result.values.alt).toBeUndefined()
    expect(result.values.label).toBeUndefined()
    expect(result.values.placeholder).toBeUndefined()
    expect(result.values.title).toBeUndefined()
    expect(result.values.testid).toBeUndefined()
    expect(result.current).toBe('css')
  })

  it('selects current by priority: role > label > alt > placeholder > title > testid > css', () => {
    const selector = createBrowserEventTarget({
      css: 'input',
      role: { role: 'textbox', name: 'Email' },
      label: 'Email',
      alt: 'email icon',
      placeholder: 'Enter email',
      title: 'Email field',
      testId: 'email-input',
    })
    const result = toElementLocatorOptions(selector)
    expect(result.current).toBe('role')
    expect(Object.keys(result.values)).toHaveLength(7)
  })

  it('falls back through priority when higher-priority locators are missing', () => {
    const selector = createBrowserEventTarget({
      css: 'input',
      placeholder: 'Search',
      testId: 'search-box',
    })
    const result = toElementLocatorOptions(selector)
    expect(result.current).toBe('placeholder')
  })
})
