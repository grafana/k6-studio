import { QuestionMarkCircledIcon } from '@radix-ui/react-icons'
import { DropdownMenu, IconButton, Tooltip } from '@radix-ui/themes'

export function HelpButton() {
  const handleOpenDocs = () => {
    window.studio.browser.openExternalLink(
      'https://grafana.com/docs/k6-studio/'
    )
  }

  const handleReportIssue = () => {
    window.studio.browser.openExternalLink(
      'https://github.com/grafana/k6-studio/issues'
    )
  }

  const handleOpenApplicationLogs = () => {
    window.studio.log.openLogFolder()
  }

  return (
    <DropdownMenu.Root>
      <Tooltip content="Help & feedback" side="right">
        <DropdownMenu.Trigger>
          <IconButton
            area-label="Help and feedback"
            color="gray"
            variant="ghost"
          >
            <QuestionMarkCircledIcon />
          </IconButton>
        </DropdownMenu.Trigger>
      </Tooltip>
      <DropdownMenu.Content side="right">
        <DropdownMenu.Item onClick={handleOpenDocs}>
          Documentation
        </DropdownMenu.Item>
        <DropdownMenu.Item onClick={handleReportIssue}>
          Report an issue
        </DropdownMenu.Item>
        <DropdownMenu.Item onClick={handleOpenApplicationLogs}>
          Application logs
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
