import { Box, Button, Dialog, Flex, Text } from '@radix-ui/themes'

import { RecorderState } from './types'

interface ConfirmNavigationDialogProps {
  open: boolean
  state: RecorderState
  onCancel: () => void
  onStopRecording: () => void
}

export function ConfirmNavigationDialog({
  open,
  state,
  onCancel,
  onStopRecording,
}: ConfirmNavigationDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onCancel}>
      <Dialog.Content size="3">
        <Flex direction="column" minHeight="150px">
          <Dialog.Title>Recording in progress</Dialog.Title>
          <Box flexGrow="1" flexShrink="1" flexBasis="0">
            <Text>
              A recording is currently in progress. Would you like to stop it?
            </Text>
          </Box>
          <Flex justify="end" gap="3">
            <Dialog.Close>
              <Button
                disabled={state === 'saving'}
                variant="outline"
                color="orange"
              >
                Cancel
              </Button>
            </Dialog.Close>
            <Button loading={state === 'saving'} onClick={onStopRecording}>
              Stop recording
            </Button>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
