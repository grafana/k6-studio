import { Fragment } from 'react'

import { BrowserEvent } from '@/schemas/recording'
import { exhaustive } from '@/utils/typescript'
import { HighlightSelector } from 'extension/src/messaging/types'

import { ClickDescription } from './ClickDescription'
import { PageNavigationDescription } from './PageNavigationDescription'
import { Selector } from './Selector'

function formatOptions(options: string[]) {
  if (options.length === 1) {
    return <code>{options[0]}</code>
  }

  const last = options[options.length - 1]

  if (last === undefined) {
    return ''
  }

  return (
    <>
      {options.slice(0, -1).map((option, index) => {
        return (
          <Fragment key={index}>
            <code>{option}</code>,{' '}
          </Fragment>
        )
      })}{' '}
      and <code>{last}</code>
    </>
  )
}

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
    case 'navigated-to-page':
      return <PageNavigationDescription event={event} onNavigate={onNavigate} />

    case 'reloaded-page':
      return <>Reloaded page</>

    case 'clicked':
      return <ClickDescription event={event} onHighlight={onHighlight} />

    case 'input-changed':
      return (
        <>
          Changed input of{' '}
          <Selector selector={event.selector} onHighlight={onHighlight} /> to{' '}
          <code>{event.value}</code>
        </>
      )

    case 'check-changed':
      return (
        <>
          {event.checked ? 'Checked' : 'Unchecked'} checkbox{' '}
          <Selector selector={event.selector} onHighlight={onHighlight} />
        </>
      )

    case 'radio-changed':
      return (
        <>
          Switched value of <strong>{event.name}</strong> to{' '}
          <code>{event.value}</code> from{' '}
          <Selector selector={event.selector} onHighlight={onHighlight} />
        </>
      )

    case 'select-changed':
      return (
        <>
          Selected {formatOptions(event.selected)} from{' '}
          <Selector selector={event.selector} onHighlight={onHighlight} />
        </>
      )

    case 'form-submitted':
      return (
        <>
          Submitted form{' '}
          <Selector selector={event.form} onHighlight={onHighlight} />
        </>
      )

    default:
      return exhaustive(event)
  }
}
