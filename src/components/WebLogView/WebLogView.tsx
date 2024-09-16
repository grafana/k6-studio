import { css } from '@emotion/react'
import { Flex, Text, Table } from '@radix-ui/themes'
import { isEmpty } from 'lodash-es'

import { GroupedProxyData, ProxyData } from '@/types'
import { isGroupedProxyData } from './WebLogView.utils'
import { Row } from './Row'
import { Group } from './Group'
import grotIllustration from '@/assets/grot.svg'
import { ReactNode } from 'react'

interface WebLogViewProps {
  requests: ProxyData[] | GroupedProxyData
  activeGroup?: string
  selectedRequestId?: string
  noRequestsMessage?: ReactNode
  onSelectRequest: (data: ProxyData | null) => void
}

export function WebLogView({
  requests,
  activeGroup,
  selectedRequestId,
  noRequestsMessage,
  onSelectRequest,
}: WebLogViewProps) {
  if (isEmpty(requests)) {
    return <NoRequestsMessage noRequestsMessage={noRequestsMessage} />
  }

  if (isGroupedProxyData(requests)) {
    const groups = Object.entries(requests)
    if (
      activeGroup &&
      (!requests[activeGroup] || requests[activeGroup].length === 0)
    ) {
      groups.push([activeGroup, []])
    }

    return (
      <>
        {groups.map(([group, data]) => (
          <Group name={group} length={data.length} key={group}>
            <RequestList
              requests={data}
              selectedRequestId={selectedRequestId}
              onSelectRequest={onSelectRequest}
            />
          </Group>
        ))}
      </>
    )
  }

  return (
    <RequestList
      requests={requests}
      selectedRequestId={selectedRequestId}
      onSelectRequest={onSelectRequest}
    />
  )
}

interface RequestListProps {
  requests: ProxyData[]
  selectedRequestId?: string
  onSelectRequest: (data: ProxyData) => void
}

function RequestList({
  requests,
  selectedRequestId,
  onSelectRequest,
}: RequestListProps) {
  return (
    <Table.Root size="1" layout="fixed">
      <Table.Header css={{ textWrap: 'nowrap' }}>
        <Table.Row>
          <Table.ColumnHeaderCell width="90px">Method</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell width="65px">Status</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell width="30%">Host</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell width="70%">Path</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {requests.map((data) => (
          <Row
            key={data.id}
            data={data}
            isSelected={selectedRequestId === data.id}
            onSelectRequest={onSelectRequest}
          />
        ))}
      </Table.Body>
    </Table.Root>
  )
}

interface NoRequestsMessageProps {
  noRequestsMessage?: ReactNode
}

function NoRequestsMessage({
  noRequestsMessage = 'Your requests will appear here.',
}: NoRequestsMessageProps) {
  return (
    <Flex direction="column" align="center" gap="4" pt="8">
      <img
        src={grotIllustration}
        role="presentation"
        css={css`
          width: 50%;
          max-width: 300px;
        `}
      />
      {typeof noRequestsMessage === 'string' ? (
        <Text color="gray" size="1">
          {noRequestsMessage}
        </Text>
      ) : (
        noRequestsMessage
      )}
    </Flex>
  )
}
