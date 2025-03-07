import { useStudioUIStore } from '@/store/ui'
import { GearIcon } from '@radix-ui/react-icons'
import { Tooltip, IconButton } from '@radix-ui/themes'

export function SettingsButton() {
  const setIsOpen = useStudioUIStore((state) => state.setIsSettingsDialogOpen)

  return (
    <Tooltip content="Settings" side="right">
      <IconButton
        area-label="Settings"
        color="gray"
        variant="ghost"
        onClick={() => setIsOpen(true)}
      >
        <GearIcon />
      </IconButton>
    </Tooltip>
  )
}
