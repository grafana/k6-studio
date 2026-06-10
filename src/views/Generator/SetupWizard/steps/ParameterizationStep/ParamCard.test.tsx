import { Theme } from '@radix-ui/themes'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Monaco cannot load in jsdom; the editor is only reachable for customCode
// values, which these tests do not exercise.
vi.mock('@/components/Monaco/ConstrainedCodeEditor', () => ({
  ConstrainedCodeEditor: () => <div data-testid="code-editor" />,
}))

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
  value: { type: 'string', value: 'S3cret!' },
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
  useGeneratorStore.setState({ rules: [rule], variables: [], files: [] })
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
