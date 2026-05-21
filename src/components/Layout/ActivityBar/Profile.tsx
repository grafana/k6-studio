import { css } from '@emotion/react'
import { Dialog, Flex, IconButton } from '@radix-ui/themes'
import { XIcon } from 'lucide-react'

import { Profile as ProfileContent } from '@/components/Profile'
import { useAuthStatus } from '@/hooks/useAuthStatus'
import { useStudioUIStore } from '@/store/ui'

import { ProfileButton } from './ProfileButton'

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
              <XIcon />
            </IconButton>
          </Dialog.Close>
          <ProfileContent />
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export function Profile() {
  const status = useAuthStatus()
  const isOpen = useStudioUIStore((state) => state.isProfileDialogOpen)
  const openProfileDialog = useStudioUIStore((state) => state.openProfileDialog)
  const closeProfileDialog = useStudioUIStore(
    (state) => state.closeProfileDialog
  )

  return (
    <>
      <ProfileButton status={status} onClick={openProfileDialog} />
      <ProfileDialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeProfileDialog()
          }
        }}
      />
    </>
  )
}
