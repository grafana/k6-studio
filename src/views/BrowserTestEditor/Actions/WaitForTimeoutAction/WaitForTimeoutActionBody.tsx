import { Grid } from '@radix-ui/themes'

import { TimeoutForm } from '../../ActionForms/forms/TimeoutForm'
import { BrowserActionInstance } from '../../types'

type Action = Extract<BrowserActionInstance, { method: 'page.waitForTimeout' }>

interface WaitForTimeoutActionBodyProps {
  action: Action
  onChange: (action: Action) => void
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
