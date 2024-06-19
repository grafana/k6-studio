import { Card, Flex, Heading, Inset, Separator } from '@radix-ui/themes'

export function PageHeading({
  text,
  children,
}: {
  text: string
  children: React.ReactNode
}) {
  return (
    <>
      <Flex gap="2" pb="4" align="center">
        <Flex width="50%">
          <Heading>{text}</Heading>
        </Flex>
        <Flex width="50%" justify="end">
          {children}
        </Flex>
      </Flex>
      <Card variant="ghost" size="2" mb="3">
        <Inset side="x">
          <Separator size="4" style={{ backgroundColor: 'var(--gray-4)' }} />
        </Inset>
      </Card>
    </>
  )
}
