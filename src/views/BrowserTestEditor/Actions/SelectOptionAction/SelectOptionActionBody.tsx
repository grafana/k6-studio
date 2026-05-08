import { Grid } from '@radix-ui/themes'

import { LocatorSelectOptionAction } from '@/schemas/browserTest'

import { LocatorForm } from '../../ActionForms/forms/LocatorForm'
import { SelectOptionValuesForm } from '../../ActionForms/forms/SelectOptionValuesForm'

interface SelectOptionActionBodyProps {
  action: LocatorSelectOptionAction
  onChange: (action: LocatorSelectOptionAction) => void
}

export function SelectOptionActionBody({
  action,
  onChange,
}: SelectOptionActionBodyProps) {
  const handleChangeLocator = (
    locator: LocatorSelectOptionAction['locator']
  ) => {
    onChange({ ...action, locator })
  }

  const handleChangeValues = (values: LocatorSelectOptionAction['values']) => {
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
