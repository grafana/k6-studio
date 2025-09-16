import { CheckboxGroup, Flex, Text } from '@radix-ui/themes'

type AllowlistCheckGroupProps = {
  hosts: string[]
  allowlist: string[]
  onValueChange: (allowlist: string[]) => void
}

export default function AllowlistCheckGroup({
  hosts,
  allowlist,
  onValueChange,
}: AllowlistCheckGroupProps) {
  return (
    <Flex p="2" pr="4" asChild overflow="hidden">
      {/* 
        Property 'children' does not exist on type 'IntrinsicAttributes & CheckboxGroupRootProps', 
        but the Radix UI docs show that <CheckboxGroup.Root> should accept children.
        See: https://www.radix-ui.com/themes/docs/components/checkbox-group#usage

        @ts-expect-error see description above */}
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
