import { BrowserEvent } from '@/schemas/recording'
import { exhaustive } from '@/utils/typescript'
import { css } from '@emotion/react'
import { GlobeIcon, UpdateIcon } from '@radix-ui/react-icons'
import { Flex, Table } from '@radix-ui/themes'

interface EventIconProps {
  event: BrowserEvent
}

function EventIcon({ event }: EventIconProps) {
  switch (event.type) {
    case 'page-navigation':
      return <GlobeIcon />

    case 'page-reload':
      return <UpdateIcon />

    default:
      return exhaustive(event)
  }
}

interface EventDescriptionProps {
  event: BrowserEvent
}

function EventDescription({ event }: EventDescriptionProps) {
  switch (event.type) {
    case 'page-navigation':
      return (
        <span>
          Navigated to <strong>{event.url}.</strong>
        </span>
      )

    case 'page-reload':
      return <span>Reloaded page.</span>

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
        css={css`
          height: 100%;
        `}
      >
        <Table.Body>
          {events.map((event) => {
            return (
              <Table.Row key={event.eventId}>
                <Table.Cell>
                  <Flex as="span" align="center" gap="2">
                    <EventIcon event={event} />{' '}
                    <EventDescription event={event} />
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
