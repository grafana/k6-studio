import { CheckboxGroup, Flex, Text } from '@radix-ui/themes'

type AllowlistCheckGroupProps = {
  hosts: string[]
  selected: string[]
  onValueChange: (allowlist: string[]) => void
}

export default function AllowlistCheckGroup({
  hosts,
  selected: allowlist,
  onValueChange,
}: AllowlistCheckGroupProps) {
  return (
    <Flex p="2" pr="4" asChild overflow="hidden">
      <CheckboxGroup.Root
        size="2"
        value={allowlist}
        onValueChange={onValueChange}
      >
        {hosts.map((host) => (
          <Text as="label" size="2" key={host}>
            <Flex gap="2" align="center">
              <CheckboxGroup.Item value={host} /> <Text truncate>{host}</Text>
            </Flex>
          </Text>
        ))}
      </CheckboxGroup.Root>
    </Flex>
  )
}
