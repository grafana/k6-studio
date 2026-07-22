import { css } from '@emotion/react'
import { useMemo } from 'react'

import { Flex } from '@/components/primitives/Flex'
import { Table } from '@/components/primitives/Table'
import { Group } from '@/components/WebLogView/Group'
import { ElementLocator, LocatorOptions } from '@/schemas/locator'
import { BrowserEvent } from '@/schemas/recording'
import { Group as GroupType } from '@/types'
import { toFrameOptions } from '@/utils/locator'

import { EventDescription } from './EventDescription'
import { EventIcon } from './EventIcon'

interface BrowserEventListProps {
  events: BrowserEvent[]
  groups?: GroupType[]
  onNavigate: (url: string) => void
  onHighlight: (
    locator: ElementLocator | null,
    frames?: LocatorOptions[]
  ) => void
}

export function BrowserEventList({
  events,
  groups = [],
  onNavigate,
  onHighlight,
}: BrowserEventListProps) {
  const grouped = useMemo(() => {
    return groups
      .map((group) => ({
        group,
        events: events.filter((event) => event.group === group.id),
      }))
      .filter((item) => item.events.length > 0)
  }, [events, groups])

  // No events are assigned to a group (e.g. recordings saved before this
  // feature existed), fall back to a single flat list.
  if (grouped.length === 0) {
    return (
      <EventTable
        events={events}
        onNavigate={onNavigate}
        onHighlight={onHighlight}
      />
    )
  }

  return (
    <>
      {grouped.map(({ group, events }) => (
        <Group key={group.id} group={group} length={events.length}>
          <EventTable
            events={events}
            onNavigate={onNavigate}
            onHighlight={onHighlight}
          />
        </Group>
      ))}
    </>
  )
}

interface EventTableProps {
  events: BrowserEvent[]
  onNavigate: (url: string) => void
  onHighlight: (
    locator: ElementLocator | null,
    frames?: LocatorOptions[]
  ) => void
}

function EventTable({ events, onNavigate, onHighlight }: EventTableProps) {
  return (
    <Table.Root
      css={css`
        border-top: 1px solid var(--gray-6);
        width: 100%;
      `}
    >
      <Table.Body>
        {events.map((event) => {
          const frames = 'frames' in event ? event.frames : undefined

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
                      min-width: 0;
                      overflow: hidden;
                      white-space: nowrap;
                      text-overflow: ellipsis;
                      font-size: var(--studio-font-size-1);
                    `}
                  >
                    <EventDescription
                      event={event}
                      onNavigate={onNavigate}
                      onHighlight={(locator) =>
                        onHighlight(locator, toFrameOptions(frames))
                      }
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
