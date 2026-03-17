import { DropdownMenu, IconButton, Tooltip } from '@radix-ui/themes'
import { AlertTriangleIcon, BookTextIcon, CircleHelpIcon } from 'lucide-react'

export function HelpButton() {
  const handleOpenDocs = () =>
    window.studio.browser.openExternalLink(
      'https://grafana.com/docs/k6-studio/'
    )

  const handleReportIssue = () => window.studio.ui.reportIssue()

  return (
    <DropdownMenu.Root>
      <Tooltip content="Help & feedback" side="right">
        <DropdownMenu.Trigger>
          <IconButton
            aria-label="Help and feedback"
            color="gray"
            variant="ghost"
          >
            <CircleHelpIcon />
          </IconButton>
        </DropdownMenu.Trigger>
      </Tooltip>
      <DropdownMenu.Content side="right">
        <DropdownMenu.Item onClick={handleOpenDocs}>
          <BookTextIcon /> Documentation
        </DropdownMenu.Item>
        <DropdownMenu.Item onClick={handleReportIssue}>
          <AlertTriangleIcon /> Report issue
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
