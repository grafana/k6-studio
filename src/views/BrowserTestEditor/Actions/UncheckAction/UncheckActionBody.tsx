import { Grid } from '@radix-ui/themes'

import { LocatorForm } from '../../ActionForms/forms/LocatorForm'
import { BrowserActionInstance } from '../../types'

const UNCHECK_ROLES = ['checkbox', 'radio', 'switch']

type Action = Extract<BrowserActionInstance, { method: 'locator.uncheck' }>

interface UncheckActionBodyProps {
  action: Action
  onChange: (action: Action) => void
}

export function UncheckActionBody({
  action,
  onChange,
}: UncheckActionBodyProps) {
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
      Uncheck input
      <LocatorForm
        state={action.locator}
        suggestedRoles={UNCHECK_ROLES}
        onChange={handleChangeLocator}
      />
    </Grid>
  )
}
