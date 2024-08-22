import { WebLogView } from '@/components/WebLogView'
import { useAutoScroll } from '@/hooks/useAutoScroll'
import { ProxyData } from '@/types'
import { groupProxyData } from '@/utils/groups'
import { css } from '@emotion/react'
import { Flex, Heading, ScrollArea } from '@radix-ui/themes'

interface RequestsSectionProps {
  proxyData: ProxyData[]
  selectedRequestId?: string
  autoScroll?: boolean
  noRequestsMessage?: string
  onSelectRequest: (data: ProxyData | null) => void
}

export function RequestsSection({
  proxyData,
  selectedRequestId,
  noRequestsMessage,
  autoScroll = false,
  onSelectRequest,
}: RequestsSectionProps) {
  const ref = useAutoScroll(proxyData, autoScroll)

  return (
    <Flex direction="column" minHeight="0" height="100%">
      <Heading
        css={css`
          font-size: 15px;
          line-height: 24px;
          font-weight: 500;
          padding: var(--space-2) var(--space-3);
        `}
      >
        Requests ({proxyData.length})
      </Heading>
      <ScrollArea scrollbars="vertical">
        <div ref={ref}>
          <WebLogView
            requests={groupProxyData(proxyData)}
            noRequestsMessage={noRequestsMessage}
            selectedRequestId={selectedRequestId}
            onSelectRequest={onSelectRequest}
          />
        </div>
      </ScrollArea>
    </Flex>
  )
}
