import { Box, Flex, Text } from '@radix-ui/themes'

import { ProxyData } from '@/types'

import { MethodBadge } from '../MethodBadge'
import { ResponseStatusBadge } from '../ResponseStatusBadge'
import { removeQueryStringFromUrl } from './WebLogView.utils'
import { css } from '@emotion/react'

interface RowProps {
  data: ProxyData
  isSelected?: boolean
  onSelectRequest: (data: ProxyData) => void
}

export function Row({ data, isSelected, onSelectRequest }: RowProps) {
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
      <Box flexGrow="1" asChild>
        <Text
          truncate
          css={css`
            font-size: 13px;
            line-height: 24px;
          `}
        >
          {data.request.host}
          {removeQueryStringFromUrl(data.request.path)}
        </Text>
      </Box>
      <Flex minWidth="40px" justify="end" asChild>
        <ResponseStatusBadge status={data.response?.statusCode} />
      </Flex>
    </Flex>
  )
}
