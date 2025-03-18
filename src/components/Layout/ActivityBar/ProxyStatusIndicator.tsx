import { css } from '@emotion/react'
import {
  Link1Icon,
  LinkBreak1Icon,
  LinkNone1Icon,
  PlayIcon,
  Cross1Icon,
} from '@radix-ui/react-icons'
import { Box, DropdownMenu, IconButton, Tooltip } from '@radix-ui/themes'

import type { ProxyStatus } from '@/types'
import { exhaustive } from '@/utils/typescript'
import { useProxyStatus } from '@/hooks/useProxyStatus'

const COLOR_MAP: Record<ProxyStatus, string> = {
  ['online']: 'var(--green-9)',
  ['offline']: 'var(--gray-9)',
  ['starting']: 'var(--blue-9)',
}

export function ProxyStatusIndicator() {
  const status = useProxyStatus()

  const handleProxyStart = () => {
    return window.studio.proxy.launchProxy()
  }

  const handleProxyStop = () => {
    return window.studio.proxy.stopProxy()
  }

  return (
    <DropdownMenu.Root>
      <Tooltip content={`Proxy status: ${status}`} side="right">
        <DropdownMenu.Trigger>
          <IconButton
            variant="ghost"
            color="gray"
            area-label="Proxy status"
            css={{ position: 'relative', display: 'flex' }}
          >
            <ProxyStatusIcon status={status} />
            <Box
              position="absolute"
              width="6px"
              height="6px"
              bottom="6px"
              right="6px"
              css={css`
                background-color: ${COLOR_MAP[status]};
                border-radius: 50%;
              `}
            />
          </IconButton>
        </DropdownMenu.Trigger>
      </Tooltip>
      <DropdownMenu.Content side="right">
        <DropdownMenu.Item
          onClick={handleProxyStart}
          disabled={['online', 'starting'].includes(status)}
        >
          <PlayIcon /> Start
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onClick={handleProxyStop}
          disabled={['offline', 'starting'].includes(status)}
        >
          <Cross1Icon /> Stop
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

function ProxyStatusIcon({ status }: { status: ProxyStatus }) {
  switch (status) {
    case 'online':
      return <Link1Icon color="gray" />
    case 'offline':
      return <LinkBreak1Icon color="gray" />
    case 'starting':
      return <LinkNone1Icon color="gray" />
    default:
      return exhaustive(status)
  }
}
