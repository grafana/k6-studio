import { Theme } from '@radix-ui/themes'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { LoadZoneData } from '@/types/testOptions'

import { LoadZones } from './LoadZones'

describe('LoadZones (controlled)', () => {
  it('redistributes evenly when even distribution is on and zones change', async () => {
    const onChange = vi.fn<(data: LoadZoneData) => void>()
    render(
      <Theme>
        <LoadZones
          value={{
            distribution: 'even',
            zones: [
              { id: '1', loadZone: 'amazon:us:columbus', percent: 50 },
              { id: '2', loadZone: 'amazon:de:frankfurt', percent: 50 },
            ],
          }}
          onChange={onChange}
        />
      </Theme>
    )

    fireEvent.click(screen.getByText(/Add new load zone/i))

    await waitFor(() => {
      const lastCall = onChange.mock.calls.at(-1)
      expect(lastCall).toBeDefined()
      const last = lastCall![0]
      expect(last.zones).toHaveLength(3)
      expect(last.zones.reduce((sum, zone) => sum + zone.percent, 0)).toBe(100)
      const percents = last.zones.map((zone) => zone.percent)
      expect(Math.max(...percents) - Math.min(...percents)).toBeLessThanOrEqual(
        1
      )
    })
  })
})
