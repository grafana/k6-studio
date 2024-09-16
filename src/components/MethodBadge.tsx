import { Method } from '@/types'
import { Text } from '@radix-ui/themes'
import { ComponentProps } from 'react'

interface MethodBadgeProps {
  method: Method
}

export function MethodBadge({ method }: MethodBadgeProps) {
  const color = methodColor(method)
  return (
    <Text color={color} size="1" weight="bold">
      {method}
    </Text>
  )
}

function methodColor(method: Method): ComponentProps<typeof Text>['color'] {
  switch (method) {
    case 'GET':
      return 'green'
    case 'POST':
      return 'orange'
    case 'PUT':
      return 'blue'
    case 'PATCH':
      return 'indigo'
    case 'DELETE':
      return 'red'

    // Accent color
    default:
      return undefined
  }
}
