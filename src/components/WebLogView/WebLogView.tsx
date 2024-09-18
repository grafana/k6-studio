import { css } from '@emotion/react'
import { Flex, Text, Table, Box } from '@radix-ui/themes'
import { isEmpty } from 'lodash-es'

import { Group as GroupType, ProxyData } from '@/types'
import { Row } from './Row'
import { Group } from './Group'
import grotIllustration from '@/assets/grot.svg'
import { ReactNode } from 'react'

interface WebLogViewProps {
  requests: ProxyData[]
  groups?: GroupType[]
  activeGroup?: string
  selectedRequestId?: string
  noRequestsMessage?: ReactNode
  onSelectRequest: (data: ProxyData | null) => void
  onRenameGroup?: (group: GroupType) => void
}

export function WebLogView({
  requests,
  groups,
  selectedRequestId,
  noRequestsMessage,
  onSelectRequest,
  onRenameGroup,
}: WebLogViewProps) {
  if (isEmpty(requests)) {
    return <NoRequestsMessage noRequestsMessage={noRequestsMessage} />
  }

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
            onRename={onRenameGroup}
          >
            <RequestList
              requests={item.requests}
              selectedRequestId={selectedRequestId}
              onSelectRequest={onSelectRequest}
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
          <Table.ColumnHeaderCell width="70px">Method</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell width="60px">Status</Table.ColumnHeaderCell>
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
