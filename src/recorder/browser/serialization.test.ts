import { afterEach, describe, expect, it } from 'vitest'

import {
  ElementRoleSchema,
  SerializedElementStateSchema,
  serializeElementChain,
  serializeElementState,
} from './serialization'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('serializeElementState', () => {
  it('snapshots a checked native checkbox', () => {
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.checked = true
    document.body.append(checkbox)

    const state = serializeElementState(checkbox)

    expect(state.checkedState).toBe('checked')
    expect(state.isNativeCheckbox).toBe(true)
  })

  it('snapshots an unchecked native checkbox', () => {
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.checked = false
    document.body.append(checkbox)

    const state = serializeElementState(checkbox)

    expect(state.checkedState).toBe('unchecked')
    expect(state.isNativeCheckbox).toBe(true)
  })

  it('snapshots an indeterminate native checkbox', () => {
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.indeterminate = true
    document.body.append(checkbox)

    const state = serializeElementState(checkbox)

    expect(state.checkedState).toBe('indeterminate')
    expect(state.isNativeCheckbox).toBe(true)
  })

  it('reports isNativeCheckbox as false for a non-checkbox input', () => {
    const textInput = document.createElement('input')
    textInput.type = 'text'
    document.body.append(textInput)

    const state = serializeElementState(textInput)

    expect(state.isNativeCheckbox).toBe(false)
  })

  it('captures the text box value of a text input', () => {
    const textInput = document.createElement('input')
    textInput.type = 'text'
    textInput.value = 'hello world'
    document.body.append(textInput)

    const state = serializeElementState(textInput)

    expect(state.textBoxValue).toBe('hello world')
  })

  it('captures the text content of the element itself', () => {
    const div = document.createElement('div')
    div.textContent = 'Some text'
    document.body.append(div)

    const state = serializeElementState(div)

    expect(state.textContent).toBe('Some text')
  })

  it('captures an empty text content for an element without text', () => {
    const div = document.createElement('div')
    document.body.append(div)

    const state = serializeElementState(div)

    expect(state.textContent).toBe('')
  })

  it('reports a textarea as a multiline text box', () => {
    const textarea = document.createElement('textarea')
    document.body.append(textarea)

    const state = serializeElementState(textarea)

    expect(state.isMultilineTextBox).toBe(true)
  })

  it('reports an aria-multiline textbox as a multiline text box', () => {
    const div = document.createElement('div')
    div.setAttribute('role', 'textbox')
    div.setAttribute('aria-multiline', 'true')
    document.body.append(div)

    const state = serializeElementState(div)

    expect(state.isMultilineTextBox).toBe(true)
  })

  it('reports a single-line text input as not multiline', () => {
    const textInput = document.createElement('input')
    textInput.type = 'text'
    document.body.append(textInput)

    const state = serializeElementState(textInput)

    expect(state.isMultilineTextBox).toBe(false)
  })

  it('resolves multiline-ness through an associated label', () => {
    const label = document.createElement('label')
    const textarea = document.createElement('textarea')
    textarea.id = 'notes'
    label.setAttribute('for', 'notes')

    document.body.append(label, textarea)

    const state = serializeElementState(label)

    expect(state.isMultilineTextBox).toBe(true)
  })

  it('captures viewport bounds from getBoundingClientRect', () => {
    const div = document.createElement('div')
    document.body.append(div)

    div.getBoundingClientRect = () =>
      ({
        top: 10,
        left: 20,
        width: 30,
        height: 40,
      }) as DOMRect

    const state = serializeElementState(div)

    expect(state.bounds).toEqual({ top: 10, left: 20, width: 30, height: 40 })
  })

  it('resolves checked state through an associated label', () => {
    const label = document.createElement('label')
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.id = 'agree'
    checkbox.checked = true
    label.setAttribute('for', 'agree')

    document.body.append(label, checkbox)

    const state = serializeElementState(label)

    expect(state.checkedState).toBe('checked')
    expect(state.isNativeCheckbox).toBe(true)
  })

  it('parses cleanly against SerializedElementStateSchema', () => {
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    document.body.append(checkbox)

    const state = serializeElementState(checkbox)

    expect(() => SerializedElementStateSchema.parse(state)).not.toThrow()
  })
})

describe('serializeElementChain', () => {
  it('orders the chain innermost first and excludes documentElement', () => {
    const outer = document.createElement('div')
    outer.id = 'outer'
    const middle = document.createElement('div')
    middle.id = 'middle'
    const inner = document.createElement('div')
    inner.id = 'inner'

    outer.append(middle)
    middle.append(inner)
    document.body.append(outer)

    const chain = serializeElementChain(inner)

    expect(chain).toHaveLength(4)
    expect(chain.map((state) => state.target.selectors.css)).toEqual([
      '#inner',
      '#middle',
      '#outer',
      'body',
    ])
  })

  it('does not include the documentElement in the chain', () => {
    const chain = serializeElementChain(document.body)

    expect(chain).toHaveLength(1)
    expect(chain[0]?.target.selectors.css).toBe('body')
  })
})

describe('ElementRoleSchema', () => {
  it('parses both intrinsic and explicit roles', () => {
    expect(() =>
      ElementRoleSchema.parse({ type: 'intrinsic', role: 'button' })
    ).not.toThrow()
    expect(() =>
      ElementRoleSchema.parse({ type: 'explicit', role: 'tab' })
    ).not.toThrow()
  })

  it('rejects an unknown type', () => {
    expect(() =>
      ElementRoleSchema.parse({ type: 'unknown', role: 'button' })
    ).toThrow()
  })
})
