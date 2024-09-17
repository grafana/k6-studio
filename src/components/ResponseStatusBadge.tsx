import { Text } from '@radix-ui/themes'
import { ComponentProps } from 'react'

type Props = ComponentProps<typeof Text> & {
  status?: number
}

export function ResponseStatusBadge({ status, ...props }: Props) {
  const color = statusColor(status)
  return (
    <Text align="right" color={color} size="1" weight="bold" {...props}>
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
