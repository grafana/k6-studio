import { Tooltip, IconButton } from '@radix-ui/themes'
import { SettingsIcon } from 'lucide-react'

import { useStudioUIStore } from '@/store/ui'

export function SettingsButton() {
  const openSettingsDialog = useStudioUIStore(
    (state) => state.openSettingsDialog
  )

  return (
    <Tooltip content="Settings" side="right">
      <IconButton
        area-label="Settings"
        color="gray"
        variant="ghost"
        onClick={() => openSettingsDialog()}
      >
        <SettingsIcon />
      </IconButton>
    </Tooltip>
  )
}
