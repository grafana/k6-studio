import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useTypeahead } from './useTypeahead'

const options = [
  'user.name',
  'user.age',
  'user.address.city',
  'user.address.zip',
  'account.id',
  'account.balance',
]

function TestComponent() {
  const { inputProps, dropdownProps, filteredOptions, isFocused } =
    useTypeahead(options, undefined, 'onDot')

  return (
    <div>
      {/*// @ts-expect-error issue on size types*/}
      <input data-testid="typeahead-input" {...inputProps} />
      {isFocused && (
        <ul data-testid="typeahead-dropdown">
          {filteredOptions.map((opt) => (
            <li
              key={opt}
              data-testid={`option-${opt}`}
              onMouseDown={() => dropdownProps.onMouseDown(opt)}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

describe('useTypeahead', () => {
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('does not show suggestions until a dot is typed', () => {
    const { getByTestId, queryByTestId } = render(<TestComponent />)
    const input = getByTestId('typeahead-input')

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'user' } })

    expect(queryByTestId('typeahead-dropdown')).toBeFalsy()
  })

  it('shows suggestions after typing prefix with dot', () => {
    const { getByTestId, queryByTestId } = render(<TestComponent />)
    const input = getByTestId('typeahead-input')

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'user.' } })

    expect(getByTestId('option-user.name')).toBeTruthy()
    expect(getByTestId('option-user.age')).toBeTruthy()
    expect(queryByTestId('option-user.address.city')).toBeTruthy()
  })

  it('filters suggestions based on current segment', () => {
    const { getByTestId, queryByTestId } = render(<TestComponent />)
    const input = getByTestId('typeahead-input')

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'user.a' } })

    expect(getByTestId('option-user.age')).toBeTruthy()
    expect(getByTestId('option-user.address.city')).toBeTruthy()
    expect(getByTestId('option-user.address.zip')).toBeTruthy()
    expect(queryByTestId('option-user.name')).toBeNull()
  })

  it('shows nested suggestions after second dot', () => {
    const { getByTestId, queryByTestId } = render(<TestComponent />)
    const input = getByTestId('typeahead-input')

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'user.address.' } })

    expect(getByTestId('option-user.address.city')).toBeTruthy()
    expect(getByTestId('option-user.address.zip')).toBeTruthy()
    expect(queryByTestId('option-user.age')).toBeNull()
  })

  it('allows selecting an option to fill input', () => {
    const { getByTestId } = render(<TestComponent />)
    const input = getByTestId('typeahead-input')

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'user.a' } })

    const option = getByTestId('option-user.age')
    fireEvent.mouseDown(option)

    expect((input as HTMLInputElement).value).toBe('user.age')
  })

  it('closes dropdown when input is unfocused', () => {
    const { getByTestId, queryByTestId } = render(
      <>
        <TestComponent />
        <button data-testid="outside" />
      </>
    )

    const input = getByTestId('typeahead-input')
    const outside = getByTestId('outside')

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'user.' } })
    expect(getByTestId('typeahead-dropdown')).toBeTruthy()

    fireEvent.blur(input)
    fireEvent.focus(outside)

    return new Promise((resolve) => {
      setTimeout(() => {
        expect(queryByTestId('typeahead-dropdown')).toBeNull()
        resolve(undefined)
      }, 120)
    })
  })

  it('shows suggestions again after selection and clear when a dot is retyped', () => {
    const { getByTestId, queryByTestId } = render(<TestComponent />)
    const input = getByTestId('typeahead-input')

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'user.a' } })

    expect(getByTestId('option-user.age')).toBeTruthy()

    fireEvent.mouseDown(getByTestId('option-user.age'))

    expect((input as HTMLInputElement).value).toBe('user.age')

    fireEvent.change(input, { target: { value: '' } })
    expect(queryByTestId('typeahead-dropdown')).toBeNull()

    fireEvent.change(input, { target: { value: 'user.' } })

    expect(getByTestId('option-user.name')).toBeTruthy()
    expect(getByTestId('option-user.age')).toBeTruthy()
  })
})
