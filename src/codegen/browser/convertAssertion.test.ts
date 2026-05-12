import { describe, expect, it } from 'vitest'

import { AssertEvent } from '@/schemas/recording'

import { convertAssertion } from './convertAssertion'

function makeAssertEvent(
  assertion: AssertEvent['assertion'],
  css = 'div.test'
): AssertEvent {
  return {
    type: 'assert',
    eventId: '1',
    timestamp: 0,
    tab: 'tab1',
    target: { selectors: { css } },
    assertion,
  }
}

describe('convertAssertion', () => {
  it('converts visibility assertion (visible) to locator.toBeVisible', () => {
    const event = makeAssertEvent({ type: 'visibility', visible: true })
    const action = convertAssertion(event)
    expect(action).toMatchObject({
      method: 'locator.toBeVisible',
      visible: true,
      locator: {
        current: 'css',
        values: { css: { type: 'css', selector: 'div.test' } },
      },
    })
  })

  it('converts visibility assertion (hidden) to locator.toBeVisible with visible:false', () => {
    const event = makeAssertEvent({ type: 'visibility', visible: false })
    const action = convertAssertion(event)
    expect(action).toMatchObject({
      method: 'locator.toBeVisible',
      visible: false,
    })
  })

  it('converts text assertion to locator.toContainText with the assertion value', () => {
    const event = makeAssertEvent({
      type: 'text',
      operation: { type: 'contains', value: 'Hello world' },
    })
    const action = convertAssertion(event)
    expect(action).toMatchObject({
      method: 'locator.toContainText',
      expected: 'Hello world',
    })
  })

  it('converts text-input assertion to locator.toHaveValue with single expected value', () => {
    const event = makeAssertEvent({
      type: 'text-input',
      expected: 'edgar@example.com',
    })
    const action = convertAssertion(event)
    expect(action).toMatchObject({
      method: 'locator.toHaveValue',
      expected: {
        current: 'single',
        values: { single: 'edgar@example.com' },
      },
    })
  })

  it('converts check assertion (checked) to locator.toBeChecked with checked:true', () => {
    const event = makeAssertEvent({
      type: 'check',
      inputType: 'native',
      expected: 'checked',
    })
    const action = convertAssertion(event)
    expect(action).toMatchObject({
      method: 'locator.toBeChecked',
      checked: true,
    })
  })

  it('converts check assertion (unchecked) to locator.toBeChecked with checked:false', () => {
    const event = makeAssertEvent({
      type: 'check',
      inputType: 'native',
      expected: 'unchecked',
    })
    const action = convertAssertion(event)
    expect(action).toMatchObject({
      method: 'locator.toBeChecked',
      checked: false,
    })
  })

  it('drops check assertion with indeterminate state', () => {
    const event = makeAssertEvent({
      type: 'check',
      inputType: 'native',
      expected: 'indeterminate',
    })
    expect(convertAssertion(event)).toBeUndefined()
  })

  it('converts check assertion (aria, checked) to locator.toBeChecked with inputType:aria', () => {
    const event = makeAssertEvent({
      type: 'check',
      inputType: 'aria',
      expected: 'checked',
    })
    const action = convertAssertion(event)
    expect(action).toMatchObject({
      method: 'locator.toBeChecked',
      checked: true,
      inputType: 'aria',
    })
  })

  it('converts check assertion (aria, unchecked) to locator.toBeChecked with inputType:aria', () => {
    const event = makeAssertEvent({
      type: 'check',
      inputType: 'aria',
      expected: 'unchecked',
    })
    const action = convertAssertion(event)
    expect(action).toMatchObject({
      method: 'locator.toBeChecked',
      checked: false,
      inputType: 'aria',
    })
  })

  it('preserves inputType:native on check assertion (checked)', () => {
    const event = makeAssertEvent({
      type: 'check',
      inputType: 'native',
      expected: 'checked',
    })
    const action = convertAssertion(event)
    expect(action).toMatchObject({
      method: 'locator.toBeChecked',
      inputType: 'native',
    })
  })

  it('drops aria check assertion with indeterminate state', () => {
    const event = makeAssertEvent({
      type: 'check',
      inputType: 'aria',
      expected: 'indeterminate',
    })
    expect(convertAssertion(event)).toBeUndefined()
  })

  it('uses toLocatorOptions for the locator field (multi-selector target)', () => {
    const event: AssertEvent = {
      type: 'assert',
      eventId: '1',
      timestamp: 0,
      tab: 'tab1',
      target: {
        selectors: {
          css: 'button',
          role: { role: 'button', name: 'Submit' },
        },
      },
      assertion: { type: 'visibility', visible: true },
    }
    const action = convertAssertion(event)
    expect(action).toMatchObject({
      method: 'locator.toBeVisible',
      locator: {
        current: 'role',
        values: {
          role: {
            type: 'role',
            role: 'button',
            options: { name: 'Submit', exact: true },
          },
        },
      },
    })
  })
})
