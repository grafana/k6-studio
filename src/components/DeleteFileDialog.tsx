import { AlertDialog, Button, Flex, Text } from '@radix-ui/themes'
import { useState, type ReactNode } from 'react'

import { FileTypeToLabel } from '@/constants/files'
import { StudioFile } from '@/types'

interface DeleteFileDialogProps {
  file: StudioFile
  trigger: ReactNode
  actionLabel?: string
  onConfirm: () => void | Promise<void>
}

export function DeleteFileDialog({
  file,
  trigger,
  actionLabel = 'Delete',
  onConfirm,
}: DeleteFileDialogProps) {
  const [open, setOpen] = useState(false)

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
  }

  const handleConfirm = async () => {
    await onConfirm()
    setOpen(false)
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={handleOpenChange}>
      <AlertDialog.Trigger onClick={() => setOpen(true)}>
        {trigger}
      </AlertDialog.Trigger>
      <AlertDialog.Content size="2" maxWidth="480px">
        <AlertDialog.Title size="3">
          Delete {FileTypeToLabel[file.type]}?
        </AlertDialog.Title>

        <Text size="2" color="gray" mb="3" as="div">
          {file.displayName}
        </Text>

        <Flex gap="3" mt="4" justify="end">
          <AlertDialog.Cancel>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <Button variant="solid" color="red" onClick={handleConfirm}>
              {actionLabel}
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  )
}
