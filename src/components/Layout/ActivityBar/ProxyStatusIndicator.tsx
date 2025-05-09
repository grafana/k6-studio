import { css } from '@emotion/react'
import { Link1Icon, LinkBreak1Icon, LinkNone1Icon } from '@radix-ui/react-icons'
import { Box, Flex, IconButton, Tooltip } from '@radix-ui/themes'

import { useProxyStatus } from '@/hooks/useProxyStatus'
import type { ProxyStatus } from '@/types'
import { exhaustive } from '@/utils/typescript'

const COLOR_MAP: Record<ProxyStatus, string> = {
  ['online']: 'var(--green-9)',
  ['offline']: 'var(--gray-9)',
  ['starting']: 'var(--blue-9)',
  ['unhealthy']: 'var(--red-9)',
}

export function ProxyStatusIndicator() {
  const status = useProxyStatus()

  const handleProxyStart = () => {
    return window.studio.proxy.launchProxy()
  }

  const handleProxyStop = () => {
    return window.studio.proxy.stopProxy()
  }

  const getTooltipContent = () => {
    if (['online', 'unhealthy'].includes(status)) {
      return 'Stop proxy'
    }
    if (status === 'offline') {
      return 'Start proxy'
    }
    return 'Proxy is starting'
  }

  return (
    <Tooltip content={getTooltipContent()} side="right">
      <IconButton
        variant="ghost"
        color="gray"
        onClick={
          ['online', 'unhealthy'].includes(status)
            ? handleProxyStop
            : handleProxyStart
        }
        disabled={status === 'starting'}
      >
        <Flex position="relative">
          <ProxyStatusIcon status={status} />
          <Box
            position="absolute"
            width="6px"
            height="6px"
            bottom="0"
            right="0"
            css={css`
              background-color: ${COLOR_MAP[status]};
              border-radius: 50%;
            `}
          />
        </Flex>
      </IconButton>
    </Tooltip>
  )
}

function ProxyStatusIcon({ status }: { status: ProxyStatus }) {
  switch (status) {
    case 'online':
    case 'unhealthy':
      return <Link1Icon color="gray" />
    case 'offline':
      return <LinkBreak1Icon color="gray" />
    case 'starting':
      return <LinkNone1Icon color="gray" />
    default:
      return exhaustive(status)
  }
}
