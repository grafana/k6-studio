import { Theme } from '@radix-ui/themes'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { ReactElement } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useGeneratorStore } from '@/store/generator'
import { CorrelationRule } from '@/types/rules'

import { AutoCorrelation } from './AutoCorrelation'
import { SuggestedRuleEntry } from './types'
import { useGenerateRules } from './useGenerateRules'

vi.mock('./useGenerateRules', () => ({ useGenerateRules: vi.fn() }))
vi.mock('./IntroductionMessage', () => ({
  IntroductionMessage: () => <div>introduction-message</div>,
}))
vi.mock('@/hooks/useListenProxyData', () => ({
  useListenProxyData: () => ({ proxyData: [], resetProxyData: vi.fn() }),
}))

const rule: CorrelationRule = {
  id: 'rule-1',
  type: 'correlation',
  enabled: true,
  extractor: {
    filter: { path: '' },
    selector: { type: 'begin-end', from: 'body', begin: 'a', end: 'b' },
    extractionMode: 'single',
  },
}

const ruleEntry: SuggestedRuleEntry = {
  rule,
  correlationState: {
    extractedValue: 'value',
    count: 1,
    matchedRequestIds: ['req-1'],
    responsesExtracted: [],
    requestsReplaced: [],
    generatedUniqueId: undefined,
  },
}

function mockGenerateRules(
  overrides: Partial<ReturnType<typeof useGenerateRules>> = {}
) {
  const result = {
    start: vi.fn(),
    error: undefined,
    status: 'ready',
    ruleEntries: [],
    actionsLog: [],
    isLoading: false,
    correlationStatus: 'not-started',
    removeRule: vi.fn(),
    updateValidationProgress: vi.fn(),
    restart: vi.fn(),
    reset: vi.fn(),
    stop: vi.fn(),
    ...overrides,
  } as unknown as ReturnType<typeof useGenerateRules>

  vi.mocked(useGenerateRules).mockReturnValue(result)

  return result
}

beforeEach(() => {
  vi.clearAllMocks()
  useGeneratorStore.setState({ rules: [] })
})

function renderWithTheme(element: ReactElement) {
  return render(<Theme>{element}</Theme>)
}

describe('AutoCorrelation', () => {
  it('shows the introduction before starting', () => {
    mockGenerateRules()

    renderWithTheme(<AutoCorrelation close={vi.fn()} />)

    expect(screen.getByText('introduction-message')).toBeDefined()
  })

  it('starts immediately when the introduction is skipped', () => {
    const { start } = mockGenerateRules()

    renderWithTheme(<AutoCorrelation close={vi.fn()} skipIntroduction />)

    expect(start).toHaveBeenCalledOnce()
    expect(screen.queryByText('introduction-message')).toBeNull()
  })

  it('renders the default footer actions while running', () => {
    mockGenerateRules({ correlationStatus: 'analyzing', isLoading: true })

    renderWithTheme(<AutoCorrelation close={vi.fn()} />)

    expect(screen.getByRole('button', { name: /Stop/ })).toBeDefined()
  })

  it('renders a custom footer instead of the default one', () => {
    mockGenerateRules({ correlationStatus: 'success' })

    renderWithTheme(
      <AutoCorrelation
        close={vi.fn()}
        footer={(context) => (
          <button type="button">
            custom-footer-{context.correlationStatus}
          </button>
        )}
      />
    )

    expect(
      screen.getByRole('button', { name: 'custom-footer-success' })
    ).toBeDefined()
    expect(screen.queryByRole('button', { name: /Discard/ })).toBeNull()
  })

  it('accepts suggested rules into the generator store without closing', async () => {
    const close = vi.fn()
    mockGenerateRules({
      correlationStatus: 'success',
      ruleEntries: [ruleEntry],
    })

    renderWithTheme(
      <AutoCorrelation
        close={close}
        footer={(context) => (
          <button type="button" onClick={context.accept}>
            accept-rules
          </button>
        )}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: 'accept-rules' }))

    expect(useGeneratorStore.getState().rules).toEqual([rule])
    expect(close).not.toHaveBeenCalled()
  })

  it('reports status changes', () => {
    const onStatusChange = vi.fn()
    mockGenerateRules({ correlationStatus: 'analyzing', isLoading: true })

    renderWithTheme(
      <AutoCorrelation close={vi.fn()} onStatusChange={onStatusChange} />
    )

    expect(onStatusChange).toHaveBeenCalledWith('analyzing')
  })
})
