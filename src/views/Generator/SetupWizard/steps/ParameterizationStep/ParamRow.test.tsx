import { Theme } from '@radix-ui/themes'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { useGeneratorStore } from '@/store/generator'
import { ParameterizationRule } from '@/types/rules'

import { ParamSuggestionMeta } from '../../state/types'

import { ParamRow } from './ParamRow'

const rule: ParameterizationRule = {
  id: 'param-rule-1',
  type: 'parameterization',
  enabled: true,
  filter: { path: '/api/login' },
  selector: { type: 'json', from: 'body', path: 'password' },
  value: { type: 'variable', variableName: 'password' },
}

const meta: ParamSuggestionMeta = {
  ruleId: 'param-rule-1',
  field: 'password',
  location: { method: 'POST', path: '/api/login', in: 'body' },
  recordedValue: 'S3cret!',
}

function renderRow() {
  return render(
    <Theme>
      <ParamRow meta={meta} rule={rule} isLast />
    </Theme>
  )
}

beforeEach(() => {
  useGeneratorStore.setState({
    rules: [rule],
    variables: [{ name: 'password', value: 'S3cret!' }],
    files: [],
  })
})

describe('ParamRow', () => {
  it('shows the field name and replacement value as plain text', () => {
    renderRow()

    expect(screen.getByText('password')).toBeDefined()
    expect(screen.getByText('S3cret!')).toBeDefined()
    // Read state has no input chrome until you edit.
    expect(screen.queryByRole('textbox')).toBeNull()
  })

  it('edits the value inline after clicking the pencil', async () => {
    renderRow()

    await userEvent.click(screen.getByRole('button', { name: 'Edit password' }))

    const input = screen.getByRole('textbox', { name: 'Value of password' })
    await userEvent.clear(input)
    await userEvent.type(input, 'hunter2{Enter}')

    expect(useGeneratorStore.getState().variables).toEqual([
      { name: 'password', value: 'hunter2' },
    ])
    expect(screen.queryByRole('textbox')).toBeNull()
  })

  it('cancels the edit on Escape without writing the store', async () => {
    renderRow()

    await userEvent.click(screen.getByRole('button', { name: 'Edit password' }))

    const input = screen.getByRole('textbox', { name: 'Value of password' })
    await userEvent.clear(input)
    await userEvent.type(input, 'discarded{Escape}')

    expect(useGeneratorStore.getState().variables).toEqual([
      { name: 'password', value: 'S3cret!' },
    ])
    expect(screen.getByText('S3cret!')).toBeDefined()
  })

  it('toggles the rule via the switch', async () => {
    renderRow()

    await userEvent.click(
      screen.getByRole('switch', { name: 'Enable password rule' })
    )

    expect(useGeneratorStore.getState().rules[0]).toMatchObject({
      enabled: false,
    })
  })

  it('has no remove button; disabling is the only opt-out', () => {
    renderRow()

    expect(
      screen.queryByRole('button', { name: 'Remove password rule' })
    ).toBeNull()
  })
})
