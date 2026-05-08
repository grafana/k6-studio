import { Grid } from '@radix-ui/themes'

import { LocatorToHaveValueAction } from '@/schemas/browserTest'

import { LocatorForm } from '../../ActionForms/forms/LocatorForm'
import { ToHaveValuesForm } from '../../ActionForms/forms/ToHaveValuesForm'

const VALUE_ROLES = ['textbox', 'combobox', 'searchbox', 'spinbutton']

interface ToHaveValueActionBodyProps {
  action: LocatorToHaveValueAction
  onChange: (action: LocatorToHaveValueAction) => void
}

export function ToHaveValueActionBody({
  action,
  onChange,
}: ToHaveValueActionBodyProps) {
  const handleChangeLocator = (
    locator: LocatorToHaveValueAction['locator']
  ) => {
    onChange({ ...action, locator })
  }

  const handleChangeValues = (values: string[]) => {
    onChange({ ...action, values })
  }

  return (
    <Grid
      columns="max-content minmax(0, max-content) max-content minmax(0, max-content) 1fr"
      gap="2"
      align="center"
      width="100%"
    >
      Expect
      <LocatorForm
        state={action.locator}
        suggestedRoles={VALUE_ROLES}
        onChange={handleChangeLocator}
      />
      to have value
      <ToHaveValuesForm values={action.values} onChange={handleChangeValues} />
    </Grid>
  )
}
