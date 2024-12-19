import { Box } from '@radix-ui/themes'

import { Group as GroupType, ProxyDataWithMatches } from '@/types'
import { Row } from './Row'
import { Group } from './Group'
import { Table } from '@/components/Table'
import { memo, useEffect, useMemo, useState } from 'react'
import { SearchResults } from './SearchResults'
import { useInspectRequest } from './Details.hooks'

interface WebLogViewProps {
  requests: ProxyDataWithMatches[]
  groups?: GroupType[]
  onUpdateGroup?: (group: GroupType) => void
}

// Memo improves performance when filtering
export const WebLogView = memo(function WebLogView({
  requests,
  groups,
  onUpdateGroup,
}: WebLogViewProps) {
  const [selectedRequestId, setSelectedRequestId] = useState<string>()
  const { setSelectedRequest } = useInspectRequest()

  const selectedRequest = useMemo(
    () => requests.find((r) => r.id === selectedRequestId),
    [requests, selectedRequestId]
  )

  useEffect(() => {
    if (selectedRequest) {
      setSelectedRequest(selectedRequest)
    }
  }, [selectedRequest, setSelectedRequest])

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
              onSelectRequestId={setSelectedRequestId}
            />
          </Group>
        ))}
      </Box>
    )
  }

  return (
    <RequestList requests={requests} onSelectRequestId={setSelectedRequestId} />
  )
})

interface RequestListProps {
  requests: ProxyDataWithMatches[]
  selectedRequestId?: string
  onSelectRequestId: (id?: string) => void
}

function RequestList({ requests, onSelectRequestId }: RequestListProps) {
  return (
    <Table.Root size="1" layout="fixed">
      <Table.Header css={{ textWrap: 'nowrap' }}>
        <Table.Row>
          <Table.ColumnHeaderCell width="70px">Method</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell width="60px">Status</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell width="80px">Type</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell width="20%">Host</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell width="80%">Path</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {requests.map((data) => (
          <Row
            key={data.id}
            data={data}
            onSelectRequestId={onSelectRequestId}
          />
        ))}
      </Table.Body>
    </Table.Root>
  )
}
