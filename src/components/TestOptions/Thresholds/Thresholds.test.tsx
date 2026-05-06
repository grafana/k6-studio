import { zodResolver } from '@hookform/resolvers/zod'
import { Theme } from '@radix-ui/themes'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { Thresholds } from './Thresholds'
import { createMetricsConfig } from './createMetricsConfig'

interface ThresholdRow {
  metric: string
  statistic: string
  condition: string
  value: number
  stopTest: boolean
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
      },
    ]
    render(
      <Theme>
        <Thresholds value={value} onChange={vi.fn()} metricsConfig={config} />
      </Theme>
    )
    expect(screen.getByDisplayValue('100')).toBeDefined()
  })
})
