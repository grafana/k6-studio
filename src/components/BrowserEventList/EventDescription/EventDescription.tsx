import { SelectOptions } from '@/components/Browser/SelectOptions'
import { BrowserEvent } from '@/schemas/recording'
import { exhaustive } from '@/utils/typescript'
import { HighlightSelector } from 'extension/src/messaging/types'

import { AssertDescription } from './AssertDescription'
import { ClickDescription } from './ClickDescription'
import { InputChangeDescription } from './InputChangeDescription'
import { PageNavigationDescription } from './PageNavigationDescription'
import { Selector } from './Selector'
import { WaitForDescription } from './WaitForDescription'

interface EventDescriptionProps {
  event: BrowserEvent
  onNavigate: (url: string) => void
  onHighlight: (selector: HighlightSelector | null) => void
}

export function EventDescription({
  event,
  onNavigate,
  onHighlight,
}: EventDescriptionProps) {
  switch (event.type) {
    case 'navigate-to-page':
      return <PageNavigationDescription event={event} onNavigate={onNavigate} />

    case 'reload-page':
      return <>Reloaded page</>

    case 'click':
      return <ClickDescription event={event} onHighlight={onHighlight} />

    case 'input-change':
      return <InputChangeDescription event={event} onHighlight={onHighlight} />

    case 'check-change':
      return (
        <>
          {event.checked ? 'Checked' : 'Unchecked'} checkbox{' '}
          <Selector
            selectors={event.target.selectors}
            onHighlight={onHighlight}
          />
        </>
      )

    case 'radio-change':
      return (
        <>
          Switched value of <strong>{event.name}</strong> to{' '}
          <code>{event.value}</code> from{' '}
          <Selector
            selectors={event.target.selectors}
            onHighlight={onHighlight}
          />
        </>
      )

    case 'select-change':
      return (
        <>
          Selected <SelectOptions options={event.selected} /> from{' '}
          <Selector
            selectors={event.target.selectors}
            onHighlight={onHighlight}
          />
        </>
      )

    case 'submit-form':
      return (
        <>
          Submitted form{' '}
          <Selector
            selectors={event.form.selectors}
            onHighlight={onHighlight}
          />
        </>
      )

    case 'assert':
      return <AssertDescription event={event} onHighlight={onHighlight} />

    case 'wait-for':
      return <WaitForDescription event={event} onHighlight={onHighlight} />

    case 'comment':
      return (
        <>
          Added a comment <em>{`"${event.text}"`}</em>
        </>
      )

    default:
      return exhaustive(event)
  }
}
