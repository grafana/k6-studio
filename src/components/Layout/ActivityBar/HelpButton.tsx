import { InfoCircledIcon } from '@radix-ui/react-icons'
import { DropdownMenu, IconButton } from '@radix-ui/themes'

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

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <IconButton area-label="Documentation" color="gray" variant="ghost">
          <InfoCircledIcon />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content side="right">
        <DropdownMenu.Item onClick={handleOpenDocs}>
          Documentation
        </DropdownMenu.Item>
        <DropdownMenu.Item onClick={handleReportIssue}>
          Report an issue
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
