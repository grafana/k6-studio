import { AlertDialog, Button, Flex } from '@radix-ui/themes'

export function SaveHarDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (val: boolean) => void
  onConfirm: () => void
}) {
  // AlertDialog.Action & AlertDialog.Cancel are swapped to
  // save the file when hitting the "enter" key
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Content maxWidth="450px">
        <AlertDialog.Title>Save HAR file</AlertDialog.Title>
        <AlertDialog.Description size="2">
          Would you like to save the current recording as a HAR file?
        </AlertDialog.Description>

        <Flex gap="3" mt="4" justify="end">
          <AlertDialog.Action>
            <Button variant="soft" color="red">
              Discard
            </Button>
          </AlertDialog.Action>
          <AlertDialog.Cancel>
            <Button variant="solid" color="green" onClick={onConfirm}>
              Save
            </Button>
          </AlertDialog.Cancel>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  )
}
