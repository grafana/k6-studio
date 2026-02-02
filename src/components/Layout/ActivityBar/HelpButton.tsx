import { Badge, DropdownMenu, IconButton, Tooltip } from '@radix-ui/themes'
import {
  AlertTriangleIcon,
  BookTextIcon,
  CircleHelpIcon,
  MessageSquareIcon,
} from 'lucide-react'

export function HelpButton() {
  const handleOpenDocs = () =>
    window.studio.browser.openExternalLink(
      'https://grafana.com/docs/k6-studio/'
    )

  const handleTakeSurvey = () =>
    window.studio.browser.openExternalLink(
      'https://www.userinterviews.com/projects/XwPjeHBAbA/apply'
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
        <DropdownMenu.Item onClick={handleTakeSurvey}>
          <MessageSquareIcon /> Take survey
          <Badge variant="solid" color="indigo" ml="1" size="1">
            New
          </Badge>
        </DropdownMenu.Item>
        <DropdownMenu.Item onClick={handleReportIssue}>
          <AlertTriangleIcon /> Report issue
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
