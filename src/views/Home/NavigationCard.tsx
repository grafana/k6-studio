import { Card, Text } from '@radix-ui/themes'

interface NavigationCardProps {
  title: string
  description: string
  onClick: () => void
}

export function NavigationCard({
  title,
  description,
  onClick,
}: NavigationCardProps) {
  return (
    <Card asChild>
      <button type="button" onClick={onClick}>
        <Text as="div" size="2" weight="bold">
          {title}
        </Text>
        <Text as="div" size="2" color="gray">
          {description}
        </Text>
      </button>
    </Card>
  )
}
