import { Flex, Spinner } from '@radix-ui/themes'
import { ReactNode } from 'react'

interface LoadingMessageProps {
  children: ReactNode
}

export function LoadingMessage({ children }: LoadingMessageProps) {
  return (
    <Flex align="center" gap="2">
      <Spinner />
      <div>{children}</div>
    </Flex>
  )
}
