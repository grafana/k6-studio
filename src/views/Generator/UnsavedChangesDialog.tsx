import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import { Box, Button, Dialog, Flex, Text } from '@radix-ui/themes'

export function UnsavedChangesDialog({
  open,
  onSave,
  onDiscard,
  onCancel,
}: {
  open: boolean
  onSave: () => void
  onDiscard: () => void
  onCancel: () => void
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onCancel}>
      <Dialog.Content size="3" maxWidth="450px">
        <Dialog.Title>
          <Flex align="center" gap="2">
            <ExclamationTriangleIcon
              color="orange"
              width="20px"
              height="20px"
            />
            Save before leaving?
          </Flex>
        </Dialog.Title>
        <Box mb="5">
          <Text>
            You have unsaved changes in the generator which will be lost upon
            navigation.
          </Text>
        </Box>
        <Flex justify="end" gap="2">
          <Dialog.Close>
            <Button variant="outline" color="orange">
              Cancel
            </Button>
          </Dialog.Close>

          <Button onClick={onDiscard} color="orange">
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
