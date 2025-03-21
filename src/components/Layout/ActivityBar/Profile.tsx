import { css } from '@emotion/react'
import { Cross1Icon, PersonIcon } from '@radix-ui/react-icons'
import { Dialog, Flex, IconButton, Tooltip } from '@radix-ui/themes'
import { useState } from 'react'

import { Profile as ProfileContent } from '@/components/Profile'

function ProfileDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content height="80vh" maxHeight="600px">
        <Flex align="center" justify="center" height="100%" width="100%">
          <Dialog.Close>
            <IconButton
              variant="ghost"
              css={css`
                position: absolute;
                top: var(--space-4);
                right: var(--space-4);
              `}
            >
              <Cross1Icon />
            </IconButton>
          </Dialog.Close>
          <ProfileContent />
        </Flex>
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
