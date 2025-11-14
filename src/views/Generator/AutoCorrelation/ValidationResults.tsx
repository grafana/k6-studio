import { ScrollArea } from '@radix-ui/themes'

import { WebLogView } from '@/components/WebLogView'
import { useProxyDataGroups } from '@/hooks/useProxyDataGroups'
import { ProxyData } from '@/types'

export function ValidationResults({
  requests: proxyData,
}: {
  requests: ProxyData[]
}) {
  const groups = useProxyDataGroups(proxyData)

  return (
    <>
      <ScrollArea css={{ height: '100%', width: '100%' }}>
        <WebLogView
          requests={proxyData}
          groups={groups}
          onSelectRequest={() => {}}
        />
      </ScrollArea>
    </>
  )
}
