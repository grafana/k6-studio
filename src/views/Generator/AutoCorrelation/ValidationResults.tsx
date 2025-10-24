import { ScrollArea } from '@radix-ui/themes'

import { WebLogView } from '@/components/WebLogView'
import { useProxyDataGroups } from '@/hooks/useProxyDataGroups'
import { ProxyData } from '@/types'

import { SuccessOverlay } from './SuccessOverlay'

export function ValidationResults({
  requests: proxyData,
  isSuccess,
}: {
  requests: ProxyData[]
  isSuccess?: boolean
}) {
  const groups = useProxyDataGroups(proxyData)

  return (
    <>
      {isSuccess && <SuccessOverlay />}
      <ScrollArea>
        <div css={{ minWidth: '500px' }}>
          <WebLogView
            requests={proxyData}
            groups={groups}
            onSelectRequest={() => {}}
          />
        </div>
      </ScrollArea>
    </>
  )
}
