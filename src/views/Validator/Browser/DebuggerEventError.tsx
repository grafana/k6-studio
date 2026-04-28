import { css } from '@emotion/react'
import { Box } from '@radix-ui/themes'

import { BrowserDebuggerEvent } from '@/main/runner/schema'

interface DebuggerEventErrorProps {
  event: BrowserDebuggerEvent
}

export function DebuggerEventError({ event }: DebuggerEventErrorProps) {
  if (
    event.state === 'begin' ||
    event.result.type === 'aborted' ||
    event.result.type === 'pass'
  ) {
    return null
  }

  // At some point we should display a formatted error message to the user,
  // but for now we'll just rely on the user being able to inspect the values
  // in the action list and console output.
  if (event.type === 'assertion' && event.result.type === 'fail') {
    return null
  }

  return (
    <Box
      css={css`
        color: var(--red-11);
        grid-column: 2 / span 1;
      `}
    >
      {event.type === 'action' && <>Error: {event.result.error}</>}
      {event.type === 'assertion' && <>Error: {event.result.message}</>}
    </Box>
  )
}
