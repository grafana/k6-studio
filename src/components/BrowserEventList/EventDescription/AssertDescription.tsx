import { Tooltip } from '@/components/primitives/Tooltip'
import { AssertEvent } from '@/schemas/recording'
import { exhaustive } from '@/utils/typescript'
import { HighlightSelector } from 'extension/src/messaging/types'

import { Selector } from './Selector'

interface AssertDescriptionProps {
  event: AssertEvent
  onHighlight: (selector: HighlightSelector | null) => void
}

export function AssertDescription({
  event: { selector, assertion },
  onHighlight,
}: AssertDescriptionProps) {
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

    case 'check':
      return (
        <>
          Assert that the checked state of{' '}
          <Selector selector={selector} onHighlight={onHighlight} /> is{' '}
          <code>{assertion.expected}</code>
        </>
      )

    case 'value':
      return (
        <>
          Assert that the input{' '}
          <Selector selector={selector} onHighlight={onHighlight} /> has the
          value{' '}
          <Tooltip asChild content={assertion.expected[0]}>
            {assertion.expected[0]}
          </Tooltip>
          .
        </>
      )

    default:
      return exhaustive(assertion)
  }
}
