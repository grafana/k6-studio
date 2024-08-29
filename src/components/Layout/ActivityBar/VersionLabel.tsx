import { Code, Flex, Tooltip } from '@radix-ui/themes'

export function VersionLabel() {
  return (
    <Tooltip
      content={
        <>
          This is an alpha version of k6 Studio.
          <br />
          Please report any issues you encounter.
        </>
      }
    >
      <Flex direction="column" gap="1" align="center">
        <Code size="1" variant="ghost" color="gray">
          v{__APP_VERSION__}
        </Code>

        <Code size="1" variant="ghost" color="gray">
          alpha
        </Code>
      </Flex>
    </Tooltip>
  )
}
