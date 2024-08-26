import { Root } from '@radix-ui/react-label'
import { Flex } from '@radix-ui/themes'

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <Flex align="center" asChild gap="2">
      <Root>{children}</Root>
    </Flex>
  )
}
