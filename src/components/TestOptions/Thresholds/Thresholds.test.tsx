import { zodResolver } from '@hookform/resolvers/zod'
import { Theme } from '@radix-ui/themes'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { createMetricsConfig } from './createMetricsConfig'
import { Thresholds } from './Thresholds'

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

  it('hides the remove button when hideRemove is set', () => {
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
          hideRemove
        />
      </Theme>
    )

    expect(
      screen.queryByRole('button', { name: 'Remove threshold' })
    ).toBeNull()
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
