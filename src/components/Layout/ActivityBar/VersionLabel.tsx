import { Code, Flex, Tooltip, Link, Text } from '@radix-ui/themes'

export function VersionLabel() {
  const handleReportIssue = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    window.studio.browser.openIssuesLinkExternal()
  }

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

        <Text align="center" size="1">
          <Link
            href="https://github.com/grafana/k6-studio/issues/new"
            target="_blank"
            onClick={handleReportIssue}
          >
            Report issues
          </Link>
        </Text>
      </Flex>
    </Tooltip>
  )
}
