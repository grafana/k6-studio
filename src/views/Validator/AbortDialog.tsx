import { Box, Button, Dialog, Flex, Text } from '@radix-ui/themes'
import { useState } from 'react'

interface AbortDialogProps {
  open: boolean
  onCancel: () => void
  onAbort: () => void
}

export function AbortDialog({ open, onCancel, onAbort }: AbortDialogProps) {
  const [isAborting, setIsAborting] = useState(false)

  async function handleAbort() {
    setIsAborting(true)
    try {
      await onAbort()
    } finally {
      setIsAborting(false)
    }
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isAborting) {
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
              <Button variant="outline" color="orange" disabled={isAborting}>
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              color="red"
              onClick={handleAbort}
              disabled={isAborting}
              loading={isAborting}
            >
              Abort
            </Button>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
