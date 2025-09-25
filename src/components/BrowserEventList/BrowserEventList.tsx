import { css } from '@emotion/react'

import { Flex } from '@/components/primitives/Flex'
import { Table } from '@/components/primitives/Table'
import { BrowserEvent } from '@/schemas/recording'
import { HighlightSelector } from 'extension/src/messaging/types'

import { EventDescription } from './EventDescription'
import { EventIcon } from './EventIcon'

interface BrowserEventListProps {
  events: BrowserEvent[]
  onNavigate: (url: string) => void
  onHighlight: (selector: HighlightSelector | null) => void
}

export function BrowserEventList({
  events,
  onNavigate,
  onHighlight,
}: BrowserEventListProps) {
  return (
    <Table.Root
      css={css`
        border-top: 1px solid var(--gray-6);
        width: 100%;
      `}
    >
      <Table.Body>
        {events.map((event) => {
          return (
            <Table.Row key={event.eventId}>
              <Table.Cell
                css={css`
                  max-width: 0;
                `}
              >
                <Flex align="center" gap="2">
                  <EventIcon event={event} />
                  <div
                    css={css`
                      display: flex;
                      align-items: center;
                      gap: 0.25rem;
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
