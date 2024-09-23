import TextSpinner from '@/components/TextSpinner/TextSpinner'
import { DotsVerticalIcon } from '@radix-ui/react-icons'
import { Button, DropdownMenu, IconButton, Tooltip } from '@radix-ui/themes'

interface ValidatorControlsProps {
  isRunning: boolean
  isScriptSelected: boolean
  isExternal: boolean
  onDeleteScript: () => void
  onRunScript: () => void
  onSelectScript: () => void
  onStopScript: () => void
}

export function ValidatorControls({
  isRunning,
  isScriptSelected,
  isExternal,
  onDeleteScript,
  onRunScript,
  onSelectScript,
  onStopScript,
}: ValidatorControlsProps) {
  return (
    <>
      {isRunning && <TextSpinner text="Running" />}
      <Button
        variant={isRunning ? 'outline' : 'solid'}
        disabled={!isScriptSelected}
        onClick={isRunning ? onStopScript : onRunScript}
      >
        {isRunning ? 'Stop run' : 'Validate script'}
      </Button>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger disabled={isRunning}>
          <IconButton variant="ghost" color="gray" aria-label="Actions">
            <DotsVerticalIcon />
          </IconButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <Tooltip content="Validate a k6 script created outside of k6 Studio">
            <DropdownMenu.Item onClick={onSelectScript}>
              Open external script
            </DropdownMenu.Item>
          </Tooltip>
          {isScriptSelected && !isExternal && (
            <DropdownMenu.Item color="red" onClick={onDeleteScript}>
              Delete
            </DropdownMenu.Item>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </>
  )
}
