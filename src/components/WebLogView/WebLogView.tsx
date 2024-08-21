import { GroupedProxyData, ProxyData } from '@/types'
import { Flex, Text } from '@radix-ui/themes'
import { isEmpty } from 'lodash-es'

import { isGroupedProxyData } from './WebLogView.utils'
import { Row } from './Row'
import { Group } from './Group'
import grotIllustration from '@/assets/grot.svg'
import { css } from '@emotion/react'

interface WebLogViewProps {
  requests: ProxyData[] | GroupedProxyData
  noRequestsMessage?: string
}

export function WebLogView({ requests, noRequestsMessage }: WebLogViewProps) {
  if (isEmpty(requests)) {
    return <NoRequestsMessage noRequestsMessage={noRequestsMessage} />
  }

  if (isGroupedProxyData(requests)) {
    return (
      <>
        {Object.entries(requests).map(([group, data]) => (
          <Group name={group} length={data.length} key={group}>
            <RequestList requests={data} />
          </Group>
        ))}
      </>
    )
  }

  return <RequestList requests={requests} />
}

interface RequestListProps {
  requests: ProxyData[]
}

function RequestList({ requests }: RequestListProps) {
  return (
    <>
      {requests.map((data) => (
        <Row key={data.id} data={data} />
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
