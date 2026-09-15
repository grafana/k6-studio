import { zodResolver } from '@hookform/resolvers/zod'
import { Theme } from '@radix-ui/themes'
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { createMetricsConfig } from './createMetricsConfig'
import { Thresholds } from './Thresholds'
import { ThresholdLikeRow } from './Thresholds.utils'

interface ThresholdRow {
  metric: string
  statistic: string
  condition: string
  value: number
  stopTest: boolean
  enabled: boolean
  id: string
}

const config = createMetricsConfig({
  response_time: { label: 'Response time', unit: 'ms', type: 'trend' },
  request_count: { label: 'Request count', unit: 'reqs', type: 'counter' },
})

describe('Thresholds (controlled)', () => {
  it('renders empty state with Add button', () => {
    render(
      <Theme>
        <Thresholds value={[]} onChange={vi.fn()} metricsConfig={config} />
      </Theme>
    )
    expect(screen.getByText(/Add threshold/i)).toBeDefined()
  })

  it('calls onChange when adding a row', async () => {
    const onChange = vi.fn<(rows: ThresholdRow[]) => void>()
    render(
      <Theme>
        <Thresholds value={[]} onChange={onChange} metricsConfig={config} />
      </Theme>
    )
    fireEvent.click(screen.getByText(/Add threshold/i))
    await waitFor(() => expect(onChange).toHaveBeenCalled())
    const lastCall = onChange.mock.calls.at(-1)
    expect(lastCall).toBeDefined()
    const next = lastCall![0]
    expect(next).toHaveLength(1)
    expect(next.at(0)?.metric).toBe('response_time')
  })

  it('renders without crashing when resolver prop is provided', () => {
    const schema = z.object({
      thresholds: z.array(
        z.object({
          id: z.string(),
          metric: z.string(),
          statistic: z.string(),
          condition: z.string(),
          value: z.number().min(0, { message: 'Invalid value' }),
          stopTest: z.boolean(),
        })
      ),
    })

    render(
      <Theme>
        <Thresholds
          value={[
            {
              id: '1',
              metric: 'response_time' as const,
              statistic: 'avg',
              condition: '<',
              value: -5,
              stopTest: false,
              enabled: true,
            },
          ]}
          onChange={vi.fn()}
          metricsConfig={config}
          resolver={zodResolver(schema)}
        />
      </Theme>
    )

    expect(screen.getByDisplayValue('-5')).toBeDefined()
  })

  it('renders existing threshold rows', () => {
    const value = [
      {
        id: '1',
        metric: 'response_time' as const,
        statistic: 'avg' as const,
        condition: '<' as const,
        value: 100,
        stopTest: false,
        enabled: true,
      },
    ]
    render(
      <Theme>
        <Thresholds value={value} onChange={vi.fn()} metricsConfig={config} />
      </Theme>
    )
    expect(screen.getByDisplayValue('100')).toBeDefined()
  })

  it('renders row annotations when getRowAnnotation matches', () => {
    const value = [
      {
        id: 'suggested-1',
        metric: 'response_time' as const,
        statistic: 'avg' as const,
        condition: '<' as const,
        value: 100,
        stopTest: false,
        enabled: true,
      },
      {
        id: 'manual-1',
        metric: 'response_time' as const,
        statistic: 'avg' as const,
        condition: '<' as const,
        value: 200,
        stopTest: false,
        enabled: true,
      },
    ]
    render(
      <Theme>
        <Thresholds
          value={value}
          onChange={vi.fn()}
          metricsConfig={config}
          getRowAnnotation={(id) =>
            id === 'suggested-1' ? 'observed p95 611 ms' : undefined
          }
        />
      </Theme>
    )

    expect(screen.getAllByText('observed p95 611 ms')).toHaveLength(1)
  })

  it('disables a threshold via the enable switch', async () => {
    const onChange = vi.fn<(rows: ThresholdRow[]) => void>()
    render(
      <Theme>
        <Thresholds
          value={[
            {
              id: '1',
              metric: 'response_time' as const,
              statistic: 'avg' as const,
              condition: '<' as const,
              value: 100,
              stopTest: false,
              enabled: true,
            },
          ]}
          onChange={onChange}
          metricsConfig={config}
        />
      </Theme>
    )

    fireEvent.click(screen.getByRole('switch', { name: 'Enable threshold' }))

    await waitFor(() => expect(onChange).toHaveBeenCalled())
    expect(onChange.mock.calls.at(-1)![0].at(0)).toMatchObject({
      enabled: false,
    })
  })

  it('shows both the switch and the remove button by default', () => {
    render(
      <Theme>
        <Thresholds
          value={[
            {
              id: '1',
              metric: 'response_time' as const,
              statistic: 'avg' as const,
              condition: '<' as const,
              value: 100,
              stopTest: false,
              enabled: true,
            },
          ]}
          onChange={vi.fn()}
          metricsConfig={config}
        />
      </Theme>
    )

    expect(
      screen.getByRole('switch', { name: 'Enable threshold' })
    ).toBeDefined()
    expect(
      screen.getByRole('button', { name: 'Remove threshold' })
    ).toBeDefined()
  })

  it('renders one control per row as decided by getRowControl', () => {
    const value = [
      {
        id: 'suggested-1',
        metric: 'response_time' as const,
        statistic: 'avg' as const,
        condition: '<' as const,
        value: 100,
        stopTest: false,
        enabled: true,
      },
      {
        id: 'manual-1',
        metric: 'response_time' as const,
        statistic: 'avg' as const,
        condition: '<' as const,
        value: 200,
        stopTest: false,
        enabled: true,
      },
    ]
    render(
      <Theme>
        <Thresholds
          value={value}
          onChange={vi.fn()}
          metricsConfig={config}
          getRowControl={(id) => (id === 'suggested-1' ? 'toggle' : 'remove')}
        />
      </Theme>
    )

    const suggestedRow = screen.getByDisplayValue('100').closest('tr')!
    expect(
      within(suggestedRow).getByRole('switch', { name: 'Enable threshold' })
    ).toBeDefined()
    expect(
      within(suggestedRow).queryByRole('button', { name: 'Remove threshold' })
    ).toBeNull()

    const manualRow = screen.getByDisplayValue('200').closest('tr')!
    expect(
      within(manualRow).getByRole('button', { name: 'Remove threshold' })
    ).toBeDefined()
    expect(
      within(manualRow).queryByRole('switch', { name: 'Enable threshold' })
    ).toBeNull()
  })

  it('removes a row via the remove button', async () => {
    // Stateful parent: the controlled form resets to `value`, so removal only
    // sticks when onChange feeds the next rows back in, like the store does.
    function StatefulThresholds() {
      const [rows, setRows] = useState<
        Array<ThresholdLikeRow & { metric: 'response_time' | 'request_count' }>
      >([
        {
          id: 'manual-1',
          metric: 'response_time',
          statistic: 'avg',
          condition: '<',
          value: 200,
          stopTest: false,
          enabled: true,
        },
      ])
      return (
        <Thresholds
          value={rows}
          onChange={setRows}
          metricsConfig={config}
          getRowControl={() => 'remove'}
        />
      )
    }
    render(
      <Theme>
        <StatefulThresholds />
      </Theme>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Remove threshold' }))

    await waitFor(() => expect(screen.queryByDisplayValue('200')).toBeNull())
  })

  it('moves the row separator to the annotation row for annotated rows', () => {
    const value = [
      {
        id: 'suggested-1',
        metric: 'response_time' as const,
        statistic: 'avg' as const,
        condition: '<' as const,
        value: 100,
        stopTest: false,
        enabled: true,
      },
    ]
    render(
      <Theme>
        <Thresholds
          value={value}
          onChange={vi.fn()}
          metricsConfig={config}
          getRowAnnotation={() => 'observed p95 611 ms'}
        />
      </Theme>
    )

    const annotationCell = screen.getByText('observed p95 611 ms').closest('td')
    const dataRow = annotationCell?.closest('tr')?.previousElementSibling

    expect(dataRow).not.toBeNull()
    expect(
      getComputedStyle(dataRow!).getPropertyValue('--table-row-box-shadow')
    ).toBe('none')
  })
})
