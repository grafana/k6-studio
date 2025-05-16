import { css } from '@emotion/react'
import { Dialog, Flex, IconButton } from '@radix-ui/themes'
import { XIcon } from 'lucide-react'

import { Script } from '@/handlers/cloud/types'

import { RunInCloudContent } from './RunInCloudContent'

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
      <Dialog.Content maxHeight="600px">
        <Flex align="stretch" justify="center" minHeight="300px" width="100%">
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
          <RunInCloudContent
            script={script}
            onClose={() => onOpenChange(false)}
          />
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
