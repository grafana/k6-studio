import { Box, Button, Dialog, Flex } from '@radix-ui/themes'

import { AutoCorrelation } from './AutoCorrelation'

interface AutoCorrelationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AutoCorrelationDialog({
  open,
  onOpenChange,
}: AutoCorrelationDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="1200px" height="750px" size="2" asChild>
        <Flex direction="column">
          <Dialog.Title>
            <Flex justify="between">
              <Flex align="center">Auto correlation</Flex>
              <Flex gap="3" justify="end" align="center">
                <Dialog.Close>
                  <Button variant="outline">Close</Button>
                </Dialog.Close>
              </Flex>
            </Flex>
          </Dialog.Title>

          <Box
            flexGrow="1"
            mx="-4"
            mb="-4"
            css={{
              borderTop: '1px solid var(--gray-5)',
            }}
          >
            <AutoCorrelation close={() => onOpenChange(false)} />
          </Box>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
