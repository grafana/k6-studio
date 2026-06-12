import { Theme } from '@radix-ui/themes'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { useGeneratorStore } from '@/store/generator'
import { ParameterizationRule } from '@/types/rules'

import { ParamSuggestionMeta } from '../../state/types'

import { ParamCard } from './ParamCard'

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
  confidence: 'high',
  secret: true,
  recordedValue: 'S3cret!',
}

function renderCard(overrides: Partial<ParamSuggestionMeta> = {}) {
  return render(
    <Theme>
      <ParamCard meta={{ ...meta, ...overrides }} rule={rule} />
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

describe('ParamCard', () => {
  it('masks secret values until revealed', async () => {
    renderCard()

    expect(screen.queryByText('S3cret!')).toBeNull()

    await userEvent.click(screen.getByRole('button', { name: 'Reveal value' }))

    expect(screen.getByText('S3cret!')).toBeDefined()
  })

  it('shows the recorded value directly for non-secret parameters', () => {
    renderCard({ secret: false })

    expect(screen.getByText('S3cret!')).toBeDefined()
    expect(screen.queryByRole('button', { name: 'Reveal value' })).toBeNull()
  })

  it('shows the variable the value is replaced with', () => {
    renderCard()

    expect(screen.getByText('password', { selector: 'code' })).toBeDefined()
    expect(
      screen.getByRole('textbox', { name: 'Value of password' })
    ).toHaveProperty('value', 'S3cret!')
  })

  it('edits the variable value in the store', async () => {
    renderCard()

    const input = screen.getByRole('textbox', { name: 'Value of password' })
    await userEvent.clear(input)
    await userEvent.type(input, 'hunter2')

    expect(useGeneratorStore.getState().variables).toEqual([
      { name: 'password', value: 'hunter2' },
    ])
  })

  it('toggles the rule via the switch', async () => {
    renderCard()

    await userEvent.click(
      screen.getByRole('switch', { name: 'Enable password rule' })
    )

    expect(useGeneratorStore.getState().rules[0]).toMatchObject({
      enabled: false,
    })
  })

  it('removes the rule from the store', async () => {
    renderCard()

    await userEvent.click(
      screen.getByRole('button', { name: 'Remove password rule' })
    )

    expect(useGeneratorStore.getState().rules).toHaveLength(0)
  })
})
