import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { initialWizardState } from '../state/reducer'
import { SetupWizardProvider, useStepState } from '../state/SetupWizardContext'
import { WizardState } from '../state/types'

import { useAbortStepOnUnmount } from './useAbortStepOnUnmount'

function Harness() {
  useAbortStepOnUnmount('hosts')

  return null
}

function StatusProbe() {
  return <div data-testid="status">{useStepState('hosts').status}</div>
}

function stateWithHosts(hosts: WizardState['steps']['hosts']): WizardState {
  return {
    ...initialWizardState,
    screen: 'wizard',
    activeStep: 'hosts',
    steps: { ...initialWizardState.steps, hosts },
  }
}

describe('useAbortStepOnUnmount', () => {
  it('aborts a running step when it unmounts mid-run', () => {
    const initialState = stateWithHosts({ status: 'running' })

    function App({ mounted }: { mounted: boolean }) {
      return (
        <SetupWizardProvider initialState={initialState}>
          {mounted && <Harness />}
          <StatusProbe />
        </SetupWizardProvider>
      )
    }

    const { rerender } = render(<App mounted />)
    expect(screen.getByTestId('status').textContent).toBe('running')

    rerender(<App mounted={false} />)
    expect(screen.getByTestId('status').textContent).toBe('aborted')
  })

  it('leaves a completed step untouched when it unmounts', () => {
    const initialState = stateWithHosts({
      status: 'completed',
      result: { step: 'hosts', suggestions: [] },
      log: [],
      summary: 'done',
    })

    function App({ mounted }: { mounted: boolean }) {
      return (
        <SetupWizardProvider initialState={initialState}>
          {mounted && <Harness />}
          <StatusProbe />
        </SetupWizardProvider>
      )
    }

    const { rerender } = render(<App mounted />)
    rerender(<App mounted={false} />)
    expect(screen.getByTestId('status').textContent).toBe('completed')
  })
})
