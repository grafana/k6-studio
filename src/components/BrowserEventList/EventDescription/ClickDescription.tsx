import { ClickPill } from '@/components/Browser/ClickPill'
import { ClickEvent } from '@/schemas/recording'
import { HighlightSelector } from 'extension/src/messaging/types'

import { Selector } from './Selector'

interface ClickDescriptionProps {
  event: ClickEvent
  onHighlight: (selector: HighlightSelector | null) => void
}

export function ClickDescription({
  event,
  onHighlight,
}: ClickDescriptionProps) {
  return (
    <>
      <ClickPill pastTense details={event} /> on element{' '}
      <Selector selectors={event.target.selectors} onHighlight={onHighlight} />
    </>
  )
}
