import { css } from '@emotion/react'

import { EventDescription } from '@/components/BrowserEventList/EventDescription'
import { EventIcon } from '@/components/BrowserEventList/EventIcon'
import { Flex } from '@/components/primitives/Flex'
import { Table } from '@/components/Table'
import { ElementLocator, LocatorOptions } from '@/schemas/locator'
import { BrowserEvent } from '@/schemas/recording'
import { toFrameOptions } from '@/utils/locator'

import { REQUEST_TABLE_COLUMN_COUNT } from './WebLogView.utils'

interface BrowserEventRowProps {
  event: BrowserEvent
  onNavigate: (url: string) => void
  onHighlight: (
    locator: ElementLocator | null,
    frames?: LocatorOptions[]
  ) => void
}

export function BrowserEventRow({
  event,
  onNavigate,
  onHighlight,
}: BrowserEventRowProps) {
  const frames = 'frames' in event ? event.frames : undefined

  return (
    <Table.Row
      css={css`
        background-color: var(--gray-a2);
      `}
    >
      <Table.Cell
        colSpan={REQUEST_TABLE_COLUMN_COUNT}
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
}
