import { Fragment } from 'react'

import { BrowserEvent } from '@/schemas/recording'
import { exhaustive } from '@/utils/typescript'

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
}

export function EventDescription({ event }: EventDescriptionProps) {
  switch (event.type) {
    case 'navigated-to-page':
      return <PageNavigationDescription event={event} />

    case 'reloaded-page':
      return <>Reloaded page.</>

    case 'clicked':
      return <ClickDescription event={event} />

    case 'input-changed':
      return (
        <>
          Changed input of <Selector>{event.selector}</Selector> to{' '}
          <code>{event.value}</code>
        </>
      )

    case 'check-changed':
      return (
        <>
          {event.checked ? 'Checked' : 'Unchecked'} checkbox{' '}
          <Selector>{event.selector}</Selector>
        </>
      )

    case 'radio-changed':
      return (
        <>
          Switched value of <strong>{event.name}</strong> to{' '}
          <code>{event.value}</code> from <Selector>{event.selector}</Selector>.
        </>
      )

    case 'select-changed':
      return (
        <>
          Selected {formatOptions(event.selected)} from{' '}
          <Selector>{event.selector}</Selector>
        </>
      )

    case 'form-submitted':
      return (
        <>
          Submitted form <Selector>{event.form}</Selector>
        </>
      )

    default:
      return exhaustive(event)
  }
}
