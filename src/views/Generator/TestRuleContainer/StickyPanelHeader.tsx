import { Flex } from '@radix-ui/themes'

export function StickyPanelHeader({ children }: { children: React.ReactNode }) {
  return (
    <Flex
      position="sticky"
      justify="center"
      top="0"
      p="2"
      py="3"
      direction="column"
      css={{
        backgroundColor: 'var(--color-background)',
        zIndex: 1,
        borderBottom: '1px solid var(--gray-3)',
      }}
    >
      {children}
    </Flex>
  )
}
