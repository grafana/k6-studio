import { Method } from '@/types'
import { Badge, Strong } from '@radix-ui/themes'
import { ComponentProps } from 'react'

type Props = ComponentProps<typeof Badge> & {
  method: Method
}

export function MethodBadge({ method, ...props }: Props) {
  const color = methodColor(method)
  return (
    <Badge mr="2" size="3" color={color} {...props}>
      <Strong>{method}</Strong>
    </Badge>
  )
}

function methodColor(method: Method): Props['color'] {
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
