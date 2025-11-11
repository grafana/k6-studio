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
  event: { target, assertion },
  onHighlight,
}: AssertDescriptionProps) {
  switch (assertion.type) {
    case 'text':
      return (
        <>
          Assert that{' '}
          <Selector selectors={target.selectors} onHighlight={onHighlight} />{' '}
          contains the text{' '}
          <Tooltip asChild content={assertion.operation.value}>
            <em>{`"${assertion.operation.value}"`}</em>
          </Tooltip>
        </>
      )

    case 'visibility':
      return (
        <>
          Assert that{' '}
          <Selector selectors={target.selectors} onHighlight={onHighlight} /> is{' '}
          {assertion.visible ? 'visible' : 'hidden'}
        </>
      )

    case 'check':
      return (
        <>
          Assert that the checked state of{' '}
          <Selector selectors={target.selectors} onHighlight={onHighlight} /> is{' '}
          <code>{assertion.expected}</code>
        </>
      )

    case 'text-input':
      return (
        <>
          Assert that the input{' '}
          <Selector selectors={target.selectors} onHighlight={onHighlight} />{' '}
          has the value{' '}
          <Tooltip asChild content={assertion.expected}>
            <em>{`"${assertion.expected}"`}</em>
          </Tooltip>
          .
        </>
      )

    default:
      return exhaustive(assertion)
  }
}
