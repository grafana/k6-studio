import { Code, Flex, Tooltip } from '@radix-ui/themes'
import pkg from '../../../../package.json'

export function VersionLabel() {
  return (
    <Tooltip
      content={
        <>
          This is a beta version of k6 Studio.
          <br />
          Please report any issues you encounter.
        </>
      }
    >
      <Flex direction="column" gap="1" align="center">
        <Code size="1" variant="ghost" color="gray">
          v{pkg.version}
        </Code>

        <Code size="1" variant="ghost" color="gray">
          beta
        </Code>
      </Flex>
    </Tooltip>
  )
}
