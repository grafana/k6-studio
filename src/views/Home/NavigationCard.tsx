import { Card, Text } from '@radix-ui/themes'
import { Link, To } from 'react-router-dom'

interface NavigationCardProps {
  title: string
  description: string
  to: To
}

export function NavigationCard({
  title,
  description,
  to,
}: NavigationCardProps) {
  return (
    <Card asChild>
      <Link to={to}>
        <Text as="div" size="2" weight="bold">
          {title}
        </Text>
        <Text as="div" size="2" color="gray">
          {description}
        </Text>
      </Link>
    </Card>
  )
}
