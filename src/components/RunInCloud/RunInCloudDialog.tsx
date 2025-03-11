import { css } from '@emotion/react'
import { Cross1Icon } from '@radix-ui/react-icons'
import { Dialog, Flex, IconButton } from '@radix-ui/themes'
import { RunInCloud } from './RunInCloud'
import { Script } from '@/handlers/cloud/types'

interface RunInCloudDialogProps {
  open: boolean
  script: Script
  onOpenChange: (open: boolean) => void
}

export function RunInCloudDialog({
  open,
  script,
  onOpenChange,
}: RunInCloudDialogProps) {
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
          <RunInCloud script={script} onClose={() => onOpenChange(false)} />
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
