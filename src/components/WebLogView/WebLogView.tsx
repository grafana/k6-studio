import { css } from '@emotion/react'
import { Flex, Text } from '@radix-ui/themes'
import { isEmpty } from 'lodash-es'

import { GroupedProxyData, ProxyData } from '@/types'
import { isGroupedProxyData } from './WebLogView.utils'
import { Row } from './Row'
import { Group } from './Group'
import grotIllustration from '@/assets/grot.svg'

interface WebLogViewProps {
  requests: ProxyData[] | GroupedProxyData
  selectedRequestId?: string
  noRequestsMessage?: string
  onSelectRequest: (data: ProxyData | null) => void
}

export function WebLogView({
  requests,
  selectedRequestId,
  noRequestsMessage,
  onSelectRequest,
}: WebLogViewProps) {
  if (isEmpty(requests)) {
    return <NoRequestsMessage noRequestsMessage={noRequestsMessage} />
  }

  if (isGroupedProxyData(requests)) {
    return (
      <>
        {Object.entries(requests).map(([group, data]) => (
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
    <>
      {requests.map((data) => (
        <Row
          key={data.id}
          data={data}
          isSelected={selectedRequestId === data.id}
          onSelectRequest={onSelectRequest}
        />
      ))}
    </>
  )
}

interface NoRequestsMessageProps {
  noRequestsMessage?: string
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
      <Text color="gray" size="1">
        {noRequestsMessage}
      </Text>
    </Flex>
  )
}
