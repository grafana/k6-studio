import { Box } from '@radix-ui/themes'
import { ComponentType, memo, useMemo } from 'react'
import { useDeepCompareEffect } from 'react-use'

import { Table } from '@/components/Table'
import { Group as GroupType, ProxyDataWithMatches } from '@/types'

import { Group } from './Group'
import { Row, RowProps } from './Row'

interface WebLogViewProps {
  requests: ProxyDataWithMatches[]
  groups: GroupType[]
  selectedRequestId?: string
  onSelectRequest: (data: ProxyDataWithMatches | null) => void
  onUpdateGroup?: (group: GroupType) => void
  filter?: string
  RowComponent?: ComponentType<RowProps>
  ListComponent?: ComponentType<RequestListProps>
}

// Memo improves performance when filtering
export const WebLogView = memo(function WebLogView({
  requests,
  groups,
  selectedRequestId,
  onSelectRequest,
  onUpdateGroup,
  filter,
  RowComponent = Row,
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

  const grouped = useMemo(
    () =>
      groups.map((group) => {
        return {
          group,
          requests: requests.filter((data) => data.group === group.id),
        }
      }),
    [requests, groups]
  )
  return (
    <Box mb="2">
      {grouped.map((item) => (
        <Group
          key={item.group.id}
          group={item.group}
          groups={groups}
          length={item.requests.length}
          onUpdate={onUpdateGroup}
        >
          <ListComponent
            requests={item.requests}
            selectedRequestId={selectedRequestId}
            onSelectRequest={onSelectRequest}
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
  selectedRequestId?: string
  onSelectRequest: (data: ProxyDataWithMatches) => void
  filter?: string
  RowComponent?: ComponentType<RowProps>
}

export function RequestList({
  requests,
  selectedRequestId,
  onSelectRequest,
  filter,
  RowComponent = Row,
}: RequestListProps) {
  return (
    <Table.Root size="1" layout="fixed">
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
        {requests.map((data) => (
          <RowComponent
            key={data.id}
            data={data}
            isSelected={selectedRequestId === data.id}
            onSelectRequest={onSelectRequest}
            filter={filter}
          />
        ))}
      </Table.Body>
    </Table.Root>
  )
}
