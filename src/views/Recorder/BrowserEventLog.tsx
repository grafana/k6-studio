import {
  BrowserEvent,
  ClickEvent,
  PageNavigationEvent,
} from '@/schemas/recording'
import { exhaustive } from '@/utils/typescript'
import { css } from '@emotion/react'
import { GlobeIcon, TargetIcon, UpdateIcon } from '@radix-ui/react-icons'
import { Flex, Table, Tooltip } from '@radix-ui/themes'

function getModifierKeys(modifiers: ClickEvent['modifiers']) {
  const keys = []
  const platform = window.studio.app.platform

  if (modifiers.ctrl) {
    keys.push('⌃ Ctrl')
  }

  if (modifiers.shift) {
    keys.push('⇧ Shift')
  }

  if (modifiers.alt) {
    keys.push(platform === 'darwin' ? '⌥ Option' : '⌥ Alt')
  }

  if (modifiers.meta) {
    keys.push(platform === 'darwin' ? '⌘ Command' : '⊞ Meta')
  }

  return keys
}

interface EventIconProps {
  event: BrowserEvent
}

function EventIcon({ event }: EventIconProps) {
  switch (event.type) {
    case 'page-navigation':
      return <GlobeIcon />

    case 'page-reload':
      return <UpdateIcon />

    case 'click':
      return <TargetIcon />

    default:
      return exhaustive(event)
  }
}

interface PageNavigationDescriptionProps {
  event: PageNavigationEvent
}

function PageNavigationDescription({ event }: PageNavigationDescriptionProps) {
  const url = (
    <Tooltip content={event.url}>
      <strong>{event.url}</strong>
    </Tooltip>
  )

  switch (event.source) {
    case 'interaction':
    case 'script':
      return <>Navigated to {url} by interacting with the page.</>

    case 'address-bar':
      return <>Navigated to {url} using the address bar.</>

    case 'history':
      return <>Navigated to {url} using the browser history.</>

    default:
      return exhaustive(event.source)
  }
}

function getButtonDescription(event: ClickEvent) {
  switch (event.button) {
    case 'left':
      return 'Clicked'

    case 'middle':
      return 'Middle-clicked'

    case 'right':
      return 'Right-clicked'

    default:
      return exhaustive(event.button)
  }
}

interface ClickDescriptionProps {
  event: ClickEvent
}

function ClickDescription({ event }: ClickDescriptionProps) {
  const modifiers = getModifierKeys(event.modifiers)
  const button = getButtonDescription(event)

  const clickedText = modifiers.concat(button).join(' + ')

  return (
    <>
      {clickedText} on element <strong>{event.selector}</strong>
    </>
  )
}

interface EventDescriptionProps {
  event: BrowserEvent
}

function EventDescription({ event }: EventDescriptionProps) {
  switch (event.type) {
    case 'page-navigation':
      return <PageNavigationDescription event={event} />

    case 'page-reload':
      return <>Reloaded page.</>

    case 'click':
      return <ClickDescription event={event} />

    default:
      return exhaustive(event)
  }
}

interface BrowserEventLogProps {
  events: BrowserEvent[]
}

export function BrowserEventLog({ events }: BrowserEventLogProps) {
  return (
    <Flex direction="column" minHeight="0" height="100%">
      <Table.Root
        layout="fixed"
        css={css`
          height: 100%;
        `}
      >
        <Table.Body>
          {events.map((event) => {
            return (
              <Table.Row key={event.eventId}>
                <Table.Cell>
                  <Flex align="center" gap="2">
                    <EventIcon event={event} />
                    <div
                      css={css`
                        flex: 1 1 0;
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                      `}
                    >
                      <EventDescription event={event} />
                    </div>
                  </Flex>
                </Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table.Root>
    </Flex>
  )
}
