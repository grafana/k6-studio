import { Box, Button, Dialog, Flex, Text } from '@radix-ui/themes'
import { useEffect, useState } from 'react'

interface AbortDialogProps {
  open: boolean
  onCancel: () => void
  onAbort: () => void
}

export function AbortDialog({ open, onCancel, onAbort }: AbortDialogProps) {
  const [isAborting, setIsAborting] = useState(false)

  useEffect(() => {
    if (open) {
      setIsAborting(false)
    }
  }, [open])

  const handleAbort = () => {
    setIsAborting(true)

    onAbort()
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen || isAborting) {
      return
    }

    onCancel()
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
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
              <Button disabled={isAborting} variant="outline" color="orange">
                Cancel
              </Button>
            </Dialog.Close>
            <Button disabled={isAborting} color="red" onClick={handleAbort}>
              Abort
            </Button>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
