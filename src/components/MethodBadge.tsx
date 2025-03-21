import { Text } from '@radix-ui/themes'
import { ComponentProps, ReactNode } from 'react'

import { Method } from '@/types'

interface MethodBadgeProps {
  method: Method
  children: ReactNode
}

export function MethodBadge({ method, children }: MethodBadgeProps) {
  const color = methodColor(method)
  return (
    <Text color={color} size="1" weight="bold" css={{ marginTop: '1px' }}>
      {children}
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
