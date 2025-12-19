import { css } from '@emotion/react'
import { Spinner } from '@radix-ui/themes'
import { CircleCheckIcon, CircleMinusIcon, CircleXIcon } from 'lucide-react'

import { BrowserActionEvent } from '@/main/runner/schema'
import { exhaustive } from '@/utils/typescript'

interface BrowserActionStatusIconProps {
  event: BrowserActionEvent
}

export function BrowserActionStatusIcon({
  event,
}: BrowserActionStatusIconProps) {
  if (event.type === 'begin') {
    return (
      <div
        css={css`
          /* 
          * Together with the width and height, this makes a total size 
          * of 20px which matches the size of the status icons.
          */
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
    case 'success':
      return <CircleCheckIcon color="var(--green-11)" />

    case 'error':
      return <CircleXIcon color="var(--red-11)" />

    case 'aborted':
      return <CircleMinusIcon color="var(--orange-11)" />

    default:
      return exhaustive(event.result)
  }
}
