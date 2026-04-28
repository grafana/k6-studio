import { ElementLocator } from '@/schemas/locator'
import { WaitForEvent } from '@/schemas/recording'

import { Selector } from './Selector'

interface WaitForDescriptionProps {
  event: WaitForEvent
  onHighlight: (selector: ElementLocator | null) => void
}

export function WaitForDescription({
  event,
  onHighlight,
}: WaitForDescriptionProps) {
  return (
    <>
      Wait for{' '}
      <Selector selectors={event.target.selectors} onHighlight={onHighlight} />
    </>
  )
}
