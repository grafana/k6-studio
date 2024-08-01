import { DotsVerticalIcon } from '@radix-ui/react-icons'
import { Button, DropdownMenu, IconButton } from '@radix-ui/themes'

interface ValidatorControlsProps {
  isRunning: boolean
  isScriptSelected: boolean
  onRunScript: () => void
  onSelectScript: () => void
  onStopScript: () => void
}

export function ValidatorControls({
  isRunning,
  isScriptSelected,
  onRunScript,
  onSelectScript,
  onStopScript,
}: ValidatorControlsProps) {
  return (
    <>
      <Button
        variant={isRunning ? 'outline' : 'solid'}
        color={isRunning ? 'orange' : 'green'}
        disabled={!isScriptSelected}
        onClick={isRunning ? onStopScript : onRunScript}
      >
        {isRunning ? 'Stop script' : 'Run script'}
      </Button>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <IconButton variant="soft" aria-label="Actions">
            <DotsVerticalIcon />
          </IconButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item onClick={onSelectScript}>
            Select script
          </DropdownMenu.Item>
          <DropdownMenu.Item color="red" disabled>
            Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </>
  )
}
