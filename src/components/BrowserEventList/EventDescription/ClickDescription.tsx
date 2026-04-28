import { ClickPill } from '@/components/Browser/ClickPill'
import { ElementLocator } from '@/schemas/locator'
import { ClickEvent } from '@/schemas/recording'

import { Selector } from './Selector'

interface ClickDescriptionProps {
  event: ClickEvent
  onHighlight: (selector: ElementLocator | null) => void
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
