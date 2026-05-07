import { Flex, Text } from '@radix-ui/themes'
import { ReactNode } from 'react'

interface SidebarEmptyStateProps {
  message: string
  action?: ReactNode
}

export function SidebarEmptyState({ message, action }: SidebarEmptyStateProps) {
  return (
    <Flex direction="column" align="center" gap="2" px="3" pt="4">
      <Text color="gray" size="1" align="center">
        {message}
      </Text>
      {action}
    </Flex>
  )
}
