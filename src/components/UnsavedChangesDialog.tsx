import { Box, Button, Dialog, Flex, IconButton, Text } from '@radix-ui/themes'
import { XIcon } from 'lucide-react'

export function UnsavedChangesDialog({
  isOpen,
  onSave,
  onDiscard,
  onCancel,
}: {
  isOpen: boolean
  onSave: () => void
  onDiscard: () => void
  onCancel: () => void
}) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onCancel}>
      <Dialog.Content size="3" maxWidth="450px" css={{ position: 'relative' }}>
        <Dialog.Title>Save before leaving?</Dialog.Title>

        <Box position="absolute" right="10px" top="10px">
          <Dialog.Close>
            <IconButton color="gray" variant="ghost">
              <XIcon />
            </IconButton>
          </Dialog.Close>
        </Box>
        <Box mb="5">
          <Text>You have unsaved changes which will be lost upon leaving.</Text>
        </Box>

        <Flex justify="end" gap="2">
          <Button onClick={onDiscard} color="orange" variant="outline">
            {"Don't save"}
          </Button>

          <Button color="orange" onClick={onSave}>
            Save
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
