import { GroupedProxyData, ProxyData } from '@/types'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import { Callout } from '@radix-ui/themes'
import { isEmpty } from 'lodash-es'
import { isGroupedProxyData } from './WebLogView.utils'
import { Row } from './Row'
import { Group } from './Group'

export function WebLogView({
  requests,
}: {
  requests: ProxyData[] | GroupedProxyData
}) {
  if (isEmpty(requests)) {
    return <NoRequestsMessage />
  }

  if (isGroupedProxyData(requests)) {
    return (
      <>
        {Object.entries(requests).map(([group, data]) => (
          <Group name={group} key={group}>
            <RequestList requests={data} />
          </Group>
        ))}
      </>
    )
  }

  return <RequestList requests={requests} />
}

function RequestList({ requests }: { requests: ProxyData[] }) {
  return (
    <>
      {requests.map((data) => (
        <Row key={data.id} data={data} />
      ))}
    </>
  )
}

function NoRequestsMessage() {
  return (
    <Callout.Root>
      <Callout.Icon>
        <InfoCircledIcon />
      </Callout.Icon>
      <Callout.Text>
        Your request will appear here when you start the recording.
      </Callout.Text>
    </Callout.Root>
  )
}
