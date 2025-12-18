import { WaitForEvent } from '@/schemas/recording'
import { HighlightSelector } from 'extension/src/messaging/types'

import { Selector } from './Selector'

interface WaitForDescriptionProps {
  event: WaitForEvent
  onHighlight: (selector: HighlightSelector | null) => void
}

export function WaitForDescription({
  event,
  onHighlight,
}: WaitForDescriptionProps) {
  return (
    <>
      Wait for{' '}
      <Selector selectors={event.target.selectors} onHighlight={onHighlight} />{' '}
      to be {event.options?.state ?? 'visible'}
    </>
  )
}
