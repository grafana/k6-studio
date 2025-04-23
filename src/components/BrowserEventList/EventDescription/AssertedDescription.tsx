import { Tooltip } from '@/components/primitives/Tooltip'
import { AssertEvent } from '@/schemas/recording'
import { exhaustive } from '@/utils/typescript'
import { HighlightSelector } from 'extension/src/messaging/types'

import { Selector } from './Selector'

interface AssertedDescriptionProps {
  event: AssertEvent
  onHighlight: (selector: HighlightSelector | null) => void
}

export function AssertedDescription({
  event: { selector, assertion },
  onHighlight,
}: AssertedDescriptionProps) {
  switch (assertion.type) {
    case 'text':
      return (
        <>
          Assert that <Selector selector={selector} onHighlight={onHighlight} />{' '}
          contains the text{' '}
          <Tooltip asChild content={assertion.operation.value}>
            <em>{`"${assertion.operation.value}"`}</em>
          </Tooltip>
        </>
      )

    case 'visibility':
      return (
        <>
          Assert that <Selector selector={selector} onHighlight={onHighlight} />{' '}
          is {assertion.visible ? 'visible' : 'hidden'}
        </>
      )

    default:
      return exhaustive(assertion)
  }
}
