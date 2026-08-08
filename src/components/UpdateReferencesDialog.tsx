import { css } from '@emotion/react'
import { Button, Dialog, Flex, Text } from '@radix-ui/themes'

import * as path from '@/utils/path'

interface UpdateReferencesDialogProps {
  open: boolean
  filePath: string
  references: string[]
  onRename: () => void
  onUpdateAndRename: () => void
  onCancel: () => void
  onCloseAutoFocus?: (e: Event) => void
}

export function UpdateReferencesDialog({
  open,
  filePath,
  references,
  onRename,
  onUpdateAndRename,
  onCancel,
  onCloseAutoFocus,
}: UpdateReferencesDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <Dialog.Content size="3" onCloseAutoFocus={onCloseAutoFocus}>
        <Dialog.Title>Update references</Dialog.Title>
        <Flex direction="column" gap="3">
          <Text>
            <Text weight="bold">{path.name(filePath)}</Text> is used by the
            following files:
          </Text>
          <Flex direction="column" gap="1" pl="3">
            {references.map((ref) => (
              <Text key={ref} color="gray">
                {path.name(ref)}
              </Text>
            ))}
          </Flex>
          <Text>Would you like to update the references in these files?</Text>
        </Flex>
        <Flex justify="end" align="center" gap="2" mt="4">
          <Dialog.Close>
            <Button
              css={css`
                margin: 0;
              `}
              variant="ghost"
            >
              Cancel
            </Button>
          </Dialog.Close>
          <Button variant="outline" color="red" onClick={onRename}>
            Rename anyway
          </Button>
          <Button onClick={onUpdateAndRename}>Update files</Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
