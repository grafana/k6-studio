import { ActionLocator } from '@/main/runner/schema'
import { WaitForEvent } from '@/schemas/recording'

import { Selector } from './Selector'

interface WaitForDescriptionProps {
  event: WaitForEvent
  onHighlight: (selector: ActionLocator | null) => void
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
