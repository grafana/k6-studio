import { getRoutePath } from '@/routeMap'
import { GearIcon } from '@radix-ui/react-icons'
import { Tooltip, IconButton } from '@radix-ui/themes'
import { useNavigate } from 'react-router-dom'

export function SettingsButton() {
  const navigate = useNavigate()

  return (
    <Tooltip content="Settings" side="right">
      <IconButton
        are-label="Settings"
        color="gray"
        variant="ghost"
        onClick={() => navigate(getRoutePath('settings'))}
      >
        <GearIcon />
      </IconButton>
    </Tooltip>
  )
}
