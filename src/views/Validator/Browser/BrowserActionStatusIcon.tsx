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
    return <Spinner />
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
