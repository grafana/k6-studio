import { describe, expect, it } from 'vitest'

import { ElementSelector } from '@/schemas/recording'

import { toLocatorOptions } from './convertEventsToActions'

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
