import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { initialWizardState } from './state/reducer'
import { SetupWizardProvider } from './state/SetupWizardContext'
import { WizardState } from './state/types'
import { WizardFooter } from './WizardFooter'

function renderFooter(state?: Partial<WizardState>) {
  return render(
    <SetupWizardProvider
      initialState={{ ...initialWizardState, screen: 'wizard', ...state }}
    >
      <WizardFooter
        canContinue={false}
        onBack={() => {}}
        onContinue={() => {}}
      />
    </SetupWizardProvider>
  )
}

describe('WizardFooter', () => {
  it('disables Back while the active step is running', () => {
    renderFooter({
      steps: { ...initialWizardState.steps, hosts: { status: 'running' } },
    })

    expect(screen.getByRole('button', { name: /Back/ })).toHaveProperty(
      'disabled',
      true
    )
  })

  it('keeps Back enabled when the active step is not running', () => {
    renderFooter()

    expect(screen.getByRole('button', { name: /Back/ })).toHaveProperty(
      'disabled',
      false
    )
  })
})
