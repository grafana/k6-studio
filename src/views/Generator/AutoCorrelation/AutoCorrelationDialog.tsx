import { Box, Dialog, Flex, IconButton } from '@radix-ui/themes'
import { XIcon } from 'lucide-react'
import { useState } from 'react'

import { AutoCorrelation } from './AutoCorrelation'
import { Status } from './Status'
import { CorrelationStatus } from './types'

interface AutoCorrelationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AutoCorrelationDialog({
  open,
  onOpenChange,
}: AutoCorrelationDialogProps) {
  const [correlationStatus, setCorrelationStatus] =
    useState<CorrelationStatus>('not-started')
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        maxWidth="1200px"
        maxHeight="750px"
        size="2"
        asChild
        width="calc(100vw - 100px)"
        height="calc(100vh - 100px)"
      >
        <Flex direction="column" height="100%">
          <Dialog.Title>
            <Flex justify="between">
              <Flex gap="3">
                <Flex align="center">Autocorrelation</Flex>
                <Status correlationStatus={correlationStatus} />
              </Flex>
              <Flex gap="3" justify="end" align="center">
                <Dialog.Close>
                  <IconButton
                    variant="ghost"
                    css={{
                      position: 'absolute',
                      top: 'var(--space-4)',
                      right: 'var(--space-4)',
                    }}
                  >
                    <XIcon />
                  </IconButton>
                </Dialog.Close>
              </Flex>
            </Flex>
          </Dialog.Title>

          <Box
            flexGrow="1"
            mx="-4"
            mb="-4"
            css={{
              minHeight: 0,
            }}
          >
            <AutoCorrelation
              close={() => onOpenChange(false)}
              onCorrelationStatusChange={setCorrelationStatus}
            />
          </Box>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
