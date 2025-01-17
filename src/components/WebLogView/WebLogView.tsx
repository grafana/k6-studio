import { Box } from '@radix-ui/themes'

import { Group as GroupType, ProxyDataWithMatches } from '@/types'
import { Row } from './Row'
import { Group } from './Group'
import { Table } from '@/components/Table'
import { memo, useMemo } from 'react'
import { useDeepCompareEffect } from 'react-use'

interface WebLogViewProps {
  requests: ProxyDataWithMatches[]
  groups?: GroupType[]
  selectedRequestId?: string
  onSelectRequest: (data: ProxyDataWithMatches | null) => void
  onUpdateGroup?: (group: GroupType) => void
  filter?: string
}

// Memo improves performance when filtering
export const WebLogView = memo(function WebLogView({
  requests,
  groups,
  selectedRequestId,
  onSelectRequest,
  onUpdateGroup,
  filter,
}: WebLogViewProps) {
  const selectedRequest = useMemo(
    () => requests.find((data) => data.id === selectedRequestId),
    [requests, selectedRequestId]
  )

  // Sync selectedRequest when requests change to show updates in correlation preview
  useDeepCompareEffect(() => {
    if (!selectedRequest) {
      return
    }

    onSelectRequest(selectedRequest)
  }, [selectedRequest, onSelectRequest])

  if (groups !== undefined) {
    const grouped = groups.map((group) => {
      return {
        group,
        requests: requests.filter((data) => data.group === group.id),
      }
    })

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
            <RequestList
              requests={item.requests}
              selectedRequestId={selectedRequestId}
              onSelectRequest={onSelectRequest}
              filter={filter}
            />
          </Group>
        ))}
      </Box>
    )
  }

  return (
    <RequestList
      requests={requests}
      selectedRequestId={selectedRequestId}
      onSelectRequest={onSelectRequest}
      filter={filter}
    />
  )
})

interface RequestListProps {
  requests: ProxyDataWithMatches[]
  selectedRequestId?: string
  onSelectRequest: (data: ProxyDataWithMatches) => void
  filter?: string
}

function RequestList({
  requests,
  selectedRequestId,
  onSelectRequest,
  filter,
}: RequestListProps) {
  return (
    <Table.Root size="1" layout="fixed">
      <Table.Header css={{ textWrap: 'nowrap' }}>
        <Table.Row>
          <Table.ColumnHeaderCell width="70px">Method</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell width="60px">Status</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell minWidth="50px" maxWidth="80px">
            Type
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell width="20%">Host</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell width="80%">Path</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {requests.map((data) => (
          <Row
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
