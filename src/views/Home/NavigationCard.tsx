import { Text } from '@radix-ui/themes'
import { PropsWithChildren } from 'react'

interface NavigationCardProps {
  title: string
  description: string
}

export function NavigationCard({
  title,
  description,
  children,
}: PropsWithChildren<NavigationCardProps>) {
  return (
    <div>
      <Text as="div" size="3" weight="medium" mb="1">
        {title}
      </Text>
      <Text as="div" size="2" color="gray" mb="3">
        {description}
      </Text>
      {children}
    </div>
  )
}
