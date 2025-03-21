import { AlertDialog, Button, Flex } from '@radix-ui/themes'

import { ButtonWithTooltip } from '@/components/ButtonWithTooltip'

export function ClearRequestsButton({
  handleConfirm,
  disabled,
}: {
  handleConfirm: () => void
  disabled: boolean
}) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger>
        <ButtonWithTooltip
          color="red"
          size="1"
          variant="surface"
          disabled={disabled}
          tooltip="Remove all requests from the recording"
        >
          Clear
        </ButtonWithTooltip>
      </AlertDialog.Trigger>
      <AlertDialog.Content size="2" maxWidth="450px">
        <AlertDialog.Title size="3">Clear requests</AlertDialog.Title>
        <AlertDialog.Description size="2">
          Are you sure? This will deleted all the recorded requests and created
          groups.
        </AlertDialog.Description>

        <Flex gap="3" mt="4" justify="end">
          <AlertDialog.Cancel>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <Button variant="solid" color="red" onClick={handleConfirm}>
              Clear
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  )
}
