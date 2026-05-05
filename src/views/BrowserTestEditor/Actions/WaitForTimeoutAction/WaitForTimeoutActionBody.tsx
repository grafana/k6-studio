import { Grid } from '@radix-ui/themes'

import { PageWaitForTimeoutAction } from '@/main/runner/schema'

import { TimeoutForm } from '../../ActionForms/forms/TimeoutForm'
import { WithEditorMetadata } from '../../types'

interface WaitForTimeoutActionBodyProps {
  action: WithEditorMetadata<PageWaitForTimeoutAction>
  onChange: (action: WithEditorMetadata<PageWaitForTimeoutAction>) => void
}

export function WaitForTimeoutActionBody({
  action,
  onChange,
}: WaitForTimeoutActionBodyProps) {
  const handleTimeoutChange = (timeout: number) => {
    onChange({ ...action, timeout })
  }

  return (
    <Grid columns="max-content auto max-content" gap="2" align="center">
      Wait for
      <TimeoutForm timeout={action.timeout} onChange={handleTimeoutChange} />
    </Grid>
  )
}
