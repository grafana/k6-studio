import { Button, Dialog, Flex, Text } from '@radix-ui/themes'

import * as path from '@/utils/path'

interface FileInUseDialogProps {
  open: boolean
  filePath: string
  references: string[]
  onConfirm: () => void
  onCancel: () => void
}

export function FileInUseDialog({
  open,
  filePath: fileName,
  references,
  onConfirm,
  onCancel,
}: FileInUseDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <Dialog.Content size="3">
        <Dialog.Title>File is in use</Dialog.Title>
        <Flex direction="column" gap="3">
          <Text>
            <Text weight="bold">{path.name(fileName)}</Text> is used by the
            following files:
          </Text>
          <Flex direction="column" gap="1" pl="3">
            {references.map((filePath) => (
              <Text key={filePath} color="gray">
                {path.name(filePath)}
              </Text>
            ))}
          </Flex>
          <Text>These files may break by continuing.</Text>
        </Flex>
        <Flex justify="end" gap="3" mt="4">
          <Dialog.Close>
            <Button variant="outline">Cancel</Button>
          </Dialog.Close>
          <Button color="red" onClick={onConfirm}>
            Delete anyway
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
