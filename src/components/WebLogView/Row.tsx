import { Flex, Text, Tooltip } from '@radix-ui/themes'

import { ProxyData } from '@/types'

import { MethodBadge } from '../MethodBadge'
import { ResponseStatusBadge } from '../ResponseStatusBadge'
import { removeProtocolFromUrl } from './WebLogView.utils'
import { css } from '@emotion/react'

interface RowProps {
  data: ProxyData
  isSelected?: boolean
  onSelectRequest: (data: ProxyData) => void
}

export function Row({ data, isSelected, onSelectRequest }: RowProps) {
  const urlWithoutProtocol = removeProtocolFromUrl(data.request.url)

  return (
    <Flex
      align="center"
      justify="between"
      flexGrow="1"
      overflow="hidden"
      px="3"
      py="2"
      onClick={() => onSelectRequest(data)}
      style={{ cursor: 'var(--cursor-button)' }}
      css={css`
        cursor: var(--cursor-button);
        border-left: 3px solid ${isSelected ? 'var(--accent-9)' : 'transparent'};

        &:not(:last-child) {
          border-bottom: 1px solid var(--gray-3);
        }
      `}
    >
      <MethodBadge method={data.request.method} />
      <Tooltip content={urlWithoutProtocol}>
        <Text
          truncate
          css={css`
            font-size: 13px;
            line-height: 24px;
          `}
        >
          {urlWithoutProtocol}
        </Text>
      </Tooltip>
      <Flex minWidth="40px" justify="end" flexGrow="1" asChild>
        <ResponseStatusBadge status={data.response?.statusCode} />
      </Flex>
    </Flex>
  )
}
