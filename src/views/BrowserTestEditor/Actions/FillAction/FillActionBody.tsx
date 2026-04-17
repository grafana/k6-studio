import { Grid } from '@radix-ui/themes'

import { FillValueForm } from '../../ActionForms/forms/FillValueForm'
import { LocatorForm } from '../../ActionForms/forms/LocatorForm'
import { BrowserActionInstance } from '../../types'

const FILL_ROLES = ['textbox', 'searchbox', 'combobox']

type Action = Extract<BrowserActionInstance, { method: 'locator.fill' }>

interface FillActionBodyProps {
  action: Action
  onChange: (action: Action) => void
}

export function FillActionBody({ action, onChange }: FillActionBodyProps) {
  const handleChangeLocator = (locator: Action['locator']) => {
    onChange({ ...action, locator })
  }

  const handleChangeValue = (value: string) => {
    onChange({ ...action, value })
  }

  return (
    <Grid
      columns="max-content minmax(0, max-content) minmax(0, max-content) 1fr"
      gap="2"
      align="center"
      width="100%"
    >
      Fill
      <LocatorForm
        state={action.locator}
        onChange={handleChangeLocator}
        suggestedRoles={FILL_ROLES}
      />
      with
      <FillValueForm value={action.value} onChange={handleChangeValue} />
    </Grid>
  )
}
