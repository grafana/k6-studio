import { BrowserEvent } from '@/schemas/recording'
import { css } from '@emotion/react'
import { Flex, Table } from '@radix-ui/themes'
import { EventDescription } from './EventDescription'
import { EventIcon } from './EventIcon'

interface BrowserEventListProps {
  events: BrowserEvent[]
  onNavigate: (url: string) => void
  onHighlight: (selector: string | null) => void
}

export function BrowserEventList({
  events,
  onNavigate,
  onHighlight,
}: BrowserEventListProps) {
  return (
    <Table.Root
      layout="fixed"
      css={css`
        border-top: 1px solid var(--gray-6);
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
                    <EventDescription
                      event={event}
                      onNavigate={onNavigate}
                      onHighlight={onHighlight}
                    />
                  </div>
                </Flex>
              </Table.Cell>
            </Table.Row>
          )
        })}
      </Table.Body>
    </Table.Root>
  )
}
