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

  return (
    <Box
      css={css`
        color: var(--red-11);
        grid-column: 2 / span 1;
      `}
    >
      {event.type === 'action' && <>Error: {event.result.error}</>}
      {event.type === 'assertion' && (
        <>
          Assertion failed:{' '}
          {event.result.type === 'fail' && (
            <pre>
              <code>{JSON.stringify(event.result.error, null, 2)}</code>
            </pre>
          )}
          {event.result.type === 'error' && event.result.message}
        </>
      )}
    </Box>
  )
}
