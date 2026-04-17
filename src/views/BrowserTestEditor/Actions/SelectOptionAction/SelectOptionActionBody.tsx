import { Grid } from '@radix-ui/themes'

import { LocatorForm } from '../../ActionForms/forms/LocatorForm'
import { SelectOptionValuesForm } from '../../ActionForms/forms/SelectOptionValuesForm'
import { BrowserActionInstance } from '../../types'

type Action = Extract<BrowserActionInstance, { method: 'locator.selectOption' }>

interface SelectOptionActionBodyProps {
  action: Action
  onChange: (action: Action) => void
}

export function SelectOptionActionBody({
  action,
  onChange,
}: SelectOptionActionBodyProps) {
  const handleChangeLocator = (locator: Action['locator']) => {
    onChange({ ...action, locator })
  }

  const handleChangeValues = (values: Action['values']) => {
    onChange({ ...action, values })
  }

  return (
    <Grid
      columns="max-content minmax(0, max-content) max-content minmax(0, max-content) 1fr"
      gap="2"
      align="center"
      width="100%"
    >
      Select
      <SelectOptionValuesForm
        values={action.values}
        onChange={handleChangeValues}
      />
      in
      <LocatorForm
        state={action.locator}
        onChange={handleChangeLocator}
        suggestedRoles={['combobox', 'listbox', 'menu', 'radiogroup']}
      />
    </Grid>
  )
}
