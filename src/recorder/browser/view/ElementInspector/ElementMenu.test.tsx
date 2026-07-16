import { fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { serializeElementChain } from '@/recorder/browser/serialization'
import { getElementDetails } from '@/utils/dom/selectors'

import { AssertionData } from './assertions/types'
import { ElementMenu } from './ElementMenu'
import { toRemoteTrackedElement, toTrackedElement } from './utils'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('ElementMenu with a live element', () => {
  it('reports a check assertion read from the live DOM', () => {
    document.body.innerHTML = '<input type="checkbox" id="checkbox" checked />'
    const checkbox = document.querySelector('#checkbox')

    if (checkbox === null) {
      throw new Error('expected #checkbox element')
    }

    const onSelectAssertion = vi.fn<(data: AssertionData) => void>()

    const { getByText } = render(
      <ElementMenu
        element={toTrackedElement(checkbox)}
        onSelectAssertion={onSelectAssertion}
        onAddWaitFor={vi.fn()}
      />
    )

    fireEvent.click(getByText('Add check assertion'))

    expect(onSelectAssertion).toHaveBeenCalledWith({
      type: 'check',
      target: getElementDetails(checkbox),
      inputType: 'native',
      expected: 'checked',
    })
  })
})

describe('ElementMenu with a remote element', () => {
  it('reports a check assertion read from the payload associated control', () => {
    document.body.innerHTML =
      '<label id="label"></label><input type="checkbox" id="checkbox" checked />'

    const label = document.querySelector('#label')
    const checkbox = document.querySelector('#checkbox')

    if (label === null || checkbox === null) {
      throw new Error('expected #label and #checkbox elements')
    }

    const [labelState] = serializeElementChain(label)
    const [checkboxState] = serializeElementChain(checkbox)

    if (labelState === undefined || checkboxState === undefined) {
      throw new Error('expected serialized states')
    }

    const remote = toRemoteTrackedElement(
      labelState,
      [],
      null,
      { left: 0, top: 0 },
      checkboxState
    )

    const onSelectAssertion = vi.fn<(data: AssertionData) => void>()

    const { getByText } = render(
      <ElementMenu
        element={remote}
        onSelectAssertion={onSelectAssertion}
        onAddWaitFor={vi.fn()}
      />
    )

    fireEvent.click(getByText('Add check assertion'))

    expect(onSelectAssertion).toHaveBeenCalledWith({
      type: 'check',
      target: checkboxState.target,
      inputType: 'native',
      expected: 'checked',
    })
  })

  it('does not render role-specific assertions when there is no associated control', () => {
    document.body.innerHTML = '<div id="target"></div>'
    const target = document.querySelector('#target')

    if (target === null) {
      throw new Error('expected #target element')
    }

    const [state] = serializeElementChain(target)

    if (state === undefined) {
      throw new Error('expected a serialized state')
    }

    const remote = toRemoteTrackedElement(state, [], null, {
      left: 0,
      top: 0,
    })

    const { queryByText } = render(
      <ElementMenu
        element={remote}
        onSelectAssertion={vi.fn()}
        onAddWaitFor={vi.fn()}
      />
    )

    expect(queryByText('Add check assertion')).toBeNull()
    expect(queryByText('Add value assertion')).toBeNull()
  })

  it('reports a text-input assertion read from the payload associated control', () => {
    document.body.innerHTML =
      '<label id="label"></label><input type="text" id="input" value="hello" />'

    const label = document.querySelector('#label')
    const input = document.querySelector('#input')

    if (label === null || input === null) {
      throw new Error('expected #label and #input elements')
    }

    const [labelState] = serializeElementChain(label)
    const [inputState] = serializeElementChain(input)

    if (labelState === undefined || inputState === undefined) {
      throw new Error('expected serialized states')
    }

    const remote = toRemoteTrackedElement(
      labelState,
      [],
      null,
      { left: 0, top: 0 },
      inputState
    )

    const onSelectAssertion = vi.fn<(data: AssertionData) => void>()

    const { getByText } = render(
      <ElementMenu
        element={remote}
        onSelectAssertion={onSelectAssertion}
        onAddWaitFor={vi.fn()}
      />
    )

    fireEvent.click(getByText('Add value assertion'))

    expect(onSelectAssertion).toHaveBeenCalledWith({
      type: 'text-input',
      target: inputState.target,
      multiline: false,
      expected: 'hello',
    })
  })

  it('reports a multiline text-input assertion for a textarea control', () => {
    document.body.innerHTML =
      '<label id="label"></label><textarea id="notes">hello</textarea>'

    const label = document.querySelector('#label')
    const textarea = document.querySelector('#notes')

    if (label === null || textarea === null) {
      throw new Error('expected #label and #notes elements')
    }

    const [labelState] = serializeElementChain(label)
    const [textareaState] = serializeElementChain(textarea)

    if (labelState === undefined || textareaState === undefined) {
      throw new Error('expected serialized states')
    }

    const remote = toRemoteTrackedElement(
      labelState,
      [],
      null,
      { left: 0, top: 0 },
      textareaState
    )

    const onSelectAssertion = vi.fn<(data: AssertionData) => void>()

    const { getByText } = render(
      <ElementMenu
        element={remote}
        onSelectAssertion={onSelectAssertion}
        onAddWaitFor={vi.fn()}
      />
    )

    fireEvent.click(getByText('Add value assertion'))

    expect(onSelectAssertion).toHaveBeenCalledWith({
      type: 'text-input',
      target: textareaState.target,
      multiline: true,
      expected: 'hello',
    })
  })

  it('prefills the text assertion from the serialized text content', () => {
    document.body.innerHTML = '<div id="target">Some text</div>'
    const target = document.querySelector('#target')

    if (target === null) {
      throw new Error('expected #target element')
    }

    const [state] = serializeElementChain(target)

    if (state === undefined) {
      throw new Error('expected a serialized state')
    }

    const remote = toRemoteTrackedElement(state, [], null, {
      left: 0,
      top: 0,
    })

    const onSelectAssertion = vi.fn<(data: AssertionData) => void>()

    const { getByText } = render(
      <ElementMenu
        element={remote}
        onSelectAssertion={onSelectAssertion}
        onAddWaitFor={vi.fn()}
      />
    )

    fireEvent.click(getByText('Add text assertion'))

    expect(onSelectAssertion).toHaveBeenCalledWith({
      type: 'text',
      target: state.target,
      text: 'Some text',
    })
  })
})
