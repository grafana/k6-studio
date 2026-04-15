import { Grid } from '@radix-ui/themes'

import { LocatorForm } from '../../ActionForms/forms/LocatorForm'
import { BrowserActionInstance } from '../../types'

const CLEAR_ROLES = ['textbox', 'searchbox', 'combobox']

type Action = Extract<BrowserActionInstance, { method: 'locator.clear' }>

interface ClearActionBodyProps {
  action: Action
  onChange: (action: Action) => void
}

export function ClearActionBody({ action, onChange }: ClearActionBodyProps) {
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
      Clear
      <LocatorForm
        state={action.locator}
        onChange={handleChangeLocator}
        suggestedRoles={CLEAR_ROLES}
      />
    </Grid>
  )
}
