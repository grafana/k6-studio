import { ChatBubbleIcon } from '@radix-ui/react-icons'
import { Code, Flex, Tooltip, IconButton } from '@radix-ui/themes'

export function VersionLabel() {
  const handleReportIssue = () => {
    window.studio.browser.openExternalLink(
      'https://github.com/grafana/k6-studio/issues'
    )
  }

  return (
    <>
      <Tooltip content="Report an issue" side="right">
        <IconButton
          are-label="Report an issue"
          color="gray"
          variant="ghost"
          onClick={handleReportIssue}
        >
          <ChatBubbleIcon />
        </IconButton>
      </Tooltip>
      <Tooltip
        content={
          <>
            This is a public preview version of k6 Studio.
            <br />
            Please report any issues you encounter.
          </>
        }
      >
        <Flex direction="column" gap="1" align="center">
          <Code size="1" variant="ghost" color="gray">
            v{__APP_VERSION__.split('-').join('')}
          </Code>
        </Flex>
      </Tooltip>
    </>
  )
}
