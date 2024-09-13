import { css } from '@emotion/react'
import { Button, Dialog, Flex, ScrollArea } from '@radix-ui/themes'

type SyntaxErrorDialogProps = {
  error?: Error
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SyntaxErrorDialog({
  error,
  open,
  onOpenChange,
}: SyntaxErrorDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <Dialog.Title>There was a problem exporting the script</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Please make sure your custom code snippets do not contain syntax
          errors.
        </Dialog.Description>

        <Flex>
          <ScrollArea scrollbars="vertical">
            <pre
              css={css`
                font-size: 13px;
              `}
            >
              {error && error.message}
            </pre>
          </ScrollArea>
        </Flex>

        <Flex gap="3" justify="end">
          <Dialog.Close>
            <Button>Close</Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
