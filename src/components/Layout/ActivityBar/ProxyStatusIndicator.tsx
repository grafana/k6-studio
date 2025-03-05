import { css } from '@emotion/react'
import { Link1Icon, LinkBreak1Icon, LinkNone1Icon } from '@radix-ui/react-icons'
import { Box, Flex, Tooltip } from '@radix-ui/themes'

import type { ProxyStatus } from '@/types'
import { exhaustive } from '@/utils/typescript'
import { useProxyStatus } from '@/hooks/useProxyStatus'

const COLOR_MAP: Record<ProxyStatus, string> = {
  ['online']: 'var(--green-9)',
  ['offline']: 'var(--gray-9)',
  ['restarting']: 'var(--blue-9)',
}

export function ProxyStatusIndicator() {
  const status = useProxyStatus()

  return (
    <Tooltip content={`Proxy status: ${status}`} side="right">
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
    </Tooltip>
  )
}

function ProxyStatusIcon({ status }: { status: ProxyStatus }) {
  switch (status) {
    case 'online':
      return <Link1Icon color="gray" />
    case 'offline':
      return <LinkBreak1Icon color="gray" />
    case 'restarting':
      return <LinkNone1Icon color="gray" />
    default:
      return exhaustive(status)
  }
}
