import { Grid } from '@radix-ui/themes'

import { LocatorForm } from '../../ActionForms/forms/LocatorForm'
import { BrowserActionInstance } from '../../types'

const CHECK_ROLES = ['checkbox', 'radio', 'switch']

type Action = Extract<BrowserActionInstance, { method: 'locator.check' }>

interface CheckActionBodyProps {
  action: Action
  onChange: (action: Action) => void
}

export function CheckActionBody({ action, onChange }: CheckActionBodyProps) {
  const handleChangeLocator = (locator: Action['locator']) => {
    onChange({ ...action, locator })
  }

  return (
    <Grid
      columns="max-content minmax(0, max-content) 1fr"
      gap="2"
      align="center"
      width="100%"
    >
      Check input
      <LocatorForm
        state={action.locator}
        suggestedRoles={CHECK_ROLES}
        onChange={handleChangeLocator}
      />
    </Grid>
  )
}
