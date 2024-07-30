import { Button } from '@radix-ui/themes'

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
      <Button onClick={onSelectScript} variant="outline">
        Select Script
      </Button>
      <Button
        variant={isRunning ? 'outline' : 'solid'}
        color={isRunning ? 'orange' : 'green'}
        disabled={!isScriptSelected}
        onClick={isRunning ? onStopScript : onRunScript}
      >
        {isRunning ? 'Stop script' : 'Run script'}
      </Button>
    </>
  )
}
