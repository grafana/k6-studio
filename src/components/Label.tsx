import { Root } from '@radix-ui/react-label'
import { Flex } from '@radix-ui/themes'

type LabelProps = React.ComponentProps<typeof Flex> & {
  children: React.ReactNode
}

export function Label({ children, ...flexProps }: LabelProps) {
  return (
    <Flex align="center" asChild gap="2" {...flexProps}>
      <Root>{children}</Root>
    </Flex>
  )
}
