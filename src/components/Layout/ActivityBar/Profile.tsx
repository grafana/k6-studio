import { PersonIcon } from '@radix-ui/react-icons'
import { Dialog, IconButton, Tooltip } from '@radix-ui/themes'
import { Profile as ProfileContent } from '@/components/Profile'
import { useState } from 'react'

function ProfileDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content height="80vh">
        <ProfileContent />
      </Dialog.Content>
    </Dialog.Root>
  )
}

export function Profile() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Tooltip content="Profile" side="right">
        <IconButton
          area-label="Profile"
          color="gray"
          variant="ghost"
          onClick={() => setOpen(true)}
        >
          <PersonIcon width="24" height="24" />
        </IconButton>
      </Tooltip>
      <ProfileDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
