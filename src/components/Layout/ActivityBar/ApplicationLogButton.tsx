import { ActivityLogIcon } from '@radix-ui/react-icons'
import { Tooltip, IconButton } from '@radix-ui/themes'

export function ApplicationLogButton() {
  const handleClick = () => {
    window.studio.app.openApplicationLog()
  }

  return (
    <Tooltip content="Application Logs" side="right">
      <IconButton
        are-label="Application Logs"
        color="gray"
        variant="ghost"
        onClick={handleClick}
      >
        <ActivityLogIcon />
      </IconButton>
    </Tooltip>
  )
}
