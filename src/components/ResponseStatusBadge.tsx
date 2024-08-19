import { css } from '@emotion/react'
import { Text } from '@radix-ui/themes'
import { ComponentProps } from 'react'

type Props = ComponentProps<typeof Text> & {
  status?: number
}

export function ResponseStatusBadge({ status, ...props }: Props) {
  const color = statusColor(status)
  return (
    <Text
      align="right"
      color={color}
      css={css`
        font-size: 13px;
        line-height: 24px;
      `}
      {...props}
    >
      {status ?? '-'}
    </Text>
  )
}

function statusColor(status: Props['status']): Props['color'] {
  if (status === undefined) {
    return 'gray'
  }

  if (status < 300) {
    return 'green'
  }

  if (status < 400) {
    return 'yellow'
  }

  return 'red'
}
