import { css } from '@emotion/react'
import { Box } from '@radix-ui/themes'
import { ComponentType, memo, useMemo } from 'react'
import { useDeepCompareEffect } from 'react-use'

import { Table } from '@/components/Table'
import { ElementLocator, LocatorOptions } from '@/schemas/locator'
import { BrowserEvent } from '@/schemas/recording'
import { Group as GroupType, ProxyDataWithMatches } from '@/types'
import {
  getTimelineItemTimestamp,
  isProxyData,
  sortByTimestamp,
  TimelineItem,
} from '@/utils/timeline'

import { BrowserEventRow } from './BrowserEventRow'
import { Group } from './Group'
import { RequestRow, RowProps } from './RequestRow'

interface WebLogViewProps {
  requests: ProxyDataWithMatches[]
  browserEvents?: BrowserEvent[]
  groups: GroupType[]
  selectedRequestId?: string
  onSelectRequest: (data: ProxyDataWithMatches | null) => void
  onUpdateGroup?: (group: GroupType) => void
  onNavigateBrowserEvent?: (url: string) => void
  onHighlightBrowserEvent?: (
    locator: ElementLocator | null,
    frames?: LocatorOptions[]
  ) => void
  filter?: string
  RowComponent?: ComponentType<RowProps>
  ListComponent?: ComponentType<RequestListProps>
}

// Memo improves performance when filtering
export const WebLogView = memo(function WebLogView({
  requests,
  browserEvents = [],
  groups,
  selectedRequestId,
  onSelectRequest,
  onUpdateGroup,
  onNavigateBrowserEvent = () => {},
  onHighlightBrowserEvent = () => {},
  filter,
  RowComponent = RequestRow,
  ListComponent = RequestList,
}: WebLogViewProps) {
  const selectedRequest = useMemo(
    () => requests.find((data) => data.id === selectedRequestId),
    [requests, selectedRequestId]
  )

  // Sync selectedRequest when requests change to show updates in correlation preview
  useDeepCompareEffect(() => {
    if (!selectedRequest) {
      // Close details if selected request no longer displayed
      onSelectRequest(null)
      return
    }

    onSelectRequest(selectedRequest)
  }, [selectedRequest, onSelectRequest])

  const grouped = useMemo(() => {
    const sortedGroups = [...groups].sort(
      (a, b) => a.startedDateTime - b.startedDateTime
    )

    return sortedGroups.map((group, index) => {
      const rangeEnd = sortedGroups[index + 1]?.startedDateTime ?? Infinity

      const isInRange = (item: TimelineItem) => {
        const timestamp = getTimelineItemTimestamp(item)
        return timestamp >= group.startedDateTime && timestamp < rangeEnd
      }

      return {
        group,
        requests: requests.filter(isInRange),
        browserEvents: browserEvents.filter(isInRange),
      }
    })
  }, [requests, browserEvents, groups])

  return (
    <Box mb="2">
      {grouped.map((item) => (
        <Group
          key={item.group.id}
          group={item.group}
          groups={groups}
          length={item.requests.length + item.browserEvents.length}
          onUpdate={onUpdateGroup}
        >
          <ListComponent
            requests={item.requests}
            browserEvents={item.browserEvents}
            selectedRequestId={selectedRequestId}
            onSelectRequest={onSelectRequest}
            onNavigateBrowserEvent={onNavigateBrowserEvent}
            onHighlightBrowserEvent={onHighlightBrowserEvent}
            filter={filter}
            RowComponent={RowComponent}
          />
        </Group>
      ))}
    </Box>
  )
})

export interface RequestListProps {
  requests: ProxyDataWithMatches[]
  browserEvents?: BrowserEvent[]
  selectedRequestId?: string
  onSelectRequest: (data: ProxyDataWithMatches) => void
  onNavigateBrowserEvent?: (url: string) => void
  onHighlightBrowserEvent?: (
    locator: ElementLocator | null,
    frames?: LocatorOptions[]
  ) => void
  filter?: string
  RowComponent?: ComponentType<RowProps>
}

export function RequestList({
  requests,
  browserEvents = [],
  selectedRequestId,
  onSelectRequest,
  onNavigateBrowserEvent = () => {},
  onHighlightBrowserEvent = () => {},
  filter,
  RowComponent = RequestRow,
}: RequestListProps) {
  const items = useMemo(
    () => sortByTimestamp([...requests, ...browserEvents]),
    [requests, browserEvents]
  )

  return (
    <Table.Root
      css={css`
        th,
        td {
          min-height: 40px;
        }

        th:first-of-type,
        td:first-of-type {
          padding-left: var(--space-4);
        }

        th:last-of-type,
        td:last-of-type {
          padding-right: var(--space-4);
        }
      `}
      size="1"
      layout="fixed"
    >
      <Table.Header css={{ textWrap: 'nowrap' }}>
        <Table.Row>
          <Table.ColumnHeaderCell width="70px">Method</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell width="60px">Status</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell width="50px">Type</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell width="20%">Host</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell width="80%">Path</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {items.map((item) =>
          isProxyData(item) ? (
            <RowComponent
              key={item.id}
              data={item}
              isSelected={selectedRequestId === item.id}
              onSelectRequest={onSelectRequest}
              filter={filter}
            />
          ) : (
            <BrowserEventRow
              key={item.eventId}
              event={item}
              onNavigate={onNavigateBrowserEvent}
              onHighlight={onHighlightBrowserEvent}
            />
          )
        )}
      </Table.Body>
    </Table.Root>
  )
}
