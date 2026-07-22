import { css } from '@emotion/react'
import { Spinner } from '@radix-ui/themes'
import { CircleCheckIcon, CircleMinusIcon, CircleXIcon } from 'lucide-react'

import { BrowserDebuggerEvent } from '@/main/runner/schema'
import { getStatusColor } from '@/utils/browserActionStatus'
import { exhaustive } from '@/utils/typescript'

interface DebuggerEventStatusIconProps {
  event: BrowserDebuggerEvent
}

export function DebuggerEventStatusIcon({
  event,
}: DebuggerEventStatusIconProps) {
  if (event.state === 'begin') {
    return (
      <div
        css={css`
          padding: 2px;
        `}
      >
        <Spinner
          css={css`
            width: 16px;
            height: 16px;
          `}
        />
      </div>
    )
  }

  switch (event.result.type) {
    case 'pass':
      return <CircleCheckIcon color={getStatusColor('pass')} />

    case 'fail':
    case 'error':
      return <CircleXIcon color={getStatusColor(event.result.type)} />

    case 'aborted':
      return <CircleMinusIcon color={getStatusColor('aborted')} />

    default:
      return exhaustive(event.result)
  }
}
