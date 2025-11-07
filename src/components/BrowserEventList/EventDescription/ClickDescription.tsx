import { ClickText } from '@/components/Browser/ClickText'
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
      <ClickText pastTense details={event} /> on element{' '}
      <Selector selectors={event.target.selectors} onHighlight={onHighlight} />
    </>
  )
}
