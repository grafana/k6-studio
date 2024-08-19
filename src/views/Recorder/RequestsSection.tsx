import { WebLogView } from '@/components/WebLogView'
import { useAutoScroll } from '@/hooks/useAutoScroll'
import { ProxyData } from '@/types'
import { groupProxyData } from '@/utils/groups'
import { css } from '@emotion/react'
import { Flex, Heading, ScrollArea } from '@radix-ui/themes'

interface RequestsSectionProps {
  proxyData: ProxyData[]
  autoScroll?: boolean
  noRequestsMessage?: string
}

export function RequestsSection({
  proxyData,
  noRequestsMessage,
  autoScroll = false,
}: RequestsSectionProps) {
  const ref = useAutoScroll(proxyData, autoScroll)

  return (
    <Flex direction="column" minHeight="0">
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
          />
        </div>
      </ScrollArea>
    </Flex>
  )
}
