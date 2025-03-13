import { Code, Flex } from '@radix-ui/themes'

export function VersionLabel() {
  return (
    <Flex direction="column" gap="1" align="center">
      <Code size="1" variant="ghost" color="gray">
        v1.0.0
      </Code>
    </Flex>
  )
}
