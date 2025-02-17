import { Flex } from '@radix-ui/themes'

export function StickyPanelHeader({ children }: { children: React.ReactNode }) {
  return (
    <Flex
      position="sticky"
      align="center"
      top="0"
      p="2"
      gap="3"
      height="40px"
      css={{
        backgroundColor: 'var(--color-background)',
        zIndex: 1,
      }}
    >
      {children}
    </Flex>
  )
}
