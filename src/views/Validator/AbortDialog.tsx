import { Box, Button, Dialog, Flex, Text } from '@radix-ui/themes'

interface AbortDialogProps {
  open: boolean
  onCancel: () => void
  onAbort: () => void
}

export function AbortDialog({ open, onCancel, onAbort }: AbortDialogProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onCancel()
        }
      }}
    >
      <Dialog.Content size="3">
        <Flex direction="column" minHeight="150px">
          <Dialog.Title>Debugging</Dialog.Title>
          <Box flexGrow="1" flexShrink="1" flexBasis="0">
            <Text>
              Leaving this view will abort the current debugging session.
            </Text>
          </Box>
          <Flex justify="end" gap="3">
            <Dialog.Close>
              <Button variant="outline" color="orange">
                Cancel
              </Button>
            </Dialog.Close>
            <Button color="red" onClick={onAbort}>
              Abort
            </Button>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
