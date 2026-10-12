import { Theme } from '@radix-ui/themes'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { StackWakePrompt } from './StackWakePrompt'

const openExternalLink = vi.fn().mockResolvedValue(undefined)

const stackUrl = 'https://mystack.grafana.net'

beforeEach(() => {
  vi.clearAllMocks()

  vi.stubGlobal('studio', {
    browser: { openExternalLink },
  })
})

describe('StackWakePrompt', () => {
  it('opens the instance in the default browser', async () => {
    render(
      <Theme>
        <StackWakePrompt url={stackUrl} />
      </Theme>
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Open my instance' })
    )

    expect(openExternalLink).toHaveBeenCalledWith(stackUrl)
  })
})
