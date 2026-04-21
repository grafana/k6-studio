import { WaitForEvent } from '@/schemas/recording'
import { NodeSelector } from '@/schemas/selectors'

import { Selector } from './Selector'

interface WaitForDescriptionProps {
  event: WaitForEvent
  onHighlight: (selector: NodeSelector | null) => void
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
