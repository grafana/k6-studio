import { GroupedProxyData, ProxyData } from '@/types'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import { Callout } from '@radix-ui/themes'
import { isEmpty } from 'lodash-es'

import { isGroupedProxyData } from './WebLogView.utils'
import { Row } from './Row'
import { Group } from './Group'

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
    <Callout.Root>
      <Callout.Icon>
        <InfoCircledIcon />
      </Callout.Icon>
      <Callout.Text>{noRequestsMessage}</Callout.Text>
    </Callout.Root>
  )
}
