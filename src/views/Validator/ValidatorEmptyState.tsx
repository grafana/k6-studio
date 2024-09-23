import { CheckCircledIcon } from '@radix-ui/react-icons'
import { Button, Spinner, Text } from '@radix-ui/themes'

interface ValidatorEmptyStateProps {
  isRunning: boolean
  isScriptSelected: boolean
  onRunScript: () => void
  onSelectScript: () => void
}

export function ValidatorEmptyState({
  isRunning,
  isScriptSelected,
  onRunScript,
  onSelectScript,
}: ValidatorEmptyStateProps) {
  if (!isScriptSelected) {
    return (
      <>
        <Text color="gray" size="1">
          Validate a k6 script created outside of k6 Studio
        </Text>
        <Button onClick={onSelectScript}>Open external script</Button>
      </>
    )
  }

  return (
    <>
      <Text color="gray" size="1">
        Start the validation run to inspect requests, logs, and checks
      </Text>
      <Button disabled={isRunning} onClick={onRunScript}>
        <Spinner loading={isRunning}>
          <CheckCircledIcon />
        </Spinner>
        Validate script
      </Button>
    </>
  )
}
