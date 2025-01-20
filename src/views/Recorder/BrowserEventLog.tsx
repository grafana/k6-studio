import { BrowserEvent, PageNavigationEvent } from '@/schemas/recording'
import { exhaustive } from '@/utils/typescript'
import { css } from '@emotion/react'
import { GlobeIcon, TargetIcon, UpdateIcon } from '@radix-ui/react-icons'
import { Flex, Table, Tooltip } from '@radix-ui/themes'

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
      return (
        <>
          Clicked on element <strong>{event.selector}</strong>
        </>
      )

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
