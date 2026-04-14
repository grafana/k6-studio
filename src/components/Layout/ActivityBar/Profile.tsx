import { css } from '@emotion/react'
import { Dialog, Flex, IconButton, Tooltip } from '@radix-ui/themes'
import { UserRoundIcon, XIcon } from 'lucide-react'

import { Profile as ProfileContent } from '@/components/Profile'
import { useStudioUIStore } from '@/store/ui'

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
  const isOpen = useStudioUIStore((state) => state.isProfileDialogOpen)
  const openProfileDialog = useStudioUIStore((state) => state.openProfileDialog)
  const closeProfileDialog = useStudioUIStore(
    (state) => state.closeProfileDialog
  )

  return (
    <>
      <Tooltip content="Profile" side="right">
        <IconButton
          area-label="Profile"
          color="gray"
          variant="ghost"
          onClick={openProfileDialog}
          css={css`
            font-size: 24px;
          `}
        >
          <UserRoundIcon />
        </IconButton>
      </Tooltip>
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
