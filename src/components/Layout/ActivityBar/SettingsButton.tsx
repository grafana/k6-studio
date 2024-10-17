import { SettingsDialog } from '@/components/Settings/SettingsDialog'
import { GearIcon } from '@radix-ui/react-icons'
import { Tooltip, IconButton } from '@radix-ui/themes'
import { useState } from 'react'

export function SettingsButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Tooltip content="Settings" side="right">
        <IconButton
          area-label="Settings"
          color="gray"
          variant="ghost"
          onClick={() => setOpen(true)}
        >
          <GearIcon />
        </IconButton>
      </Tooltip>

      <SettingsDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
