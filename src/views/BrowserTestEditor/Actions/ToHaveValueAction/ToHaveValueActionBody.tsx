import { Grid } from '@radix-ui/themes'

import { LocatorToHaveValueAction } from '@/schemas/browserTest'

import { LocatorForm } from '../../ActionForms/forms/LocatorForm'
import { ToHaveValuesForm } from '../../ActionForms/forms/ToHaveValuesForm'

const SINGLE_VALUE_ROLES = [
  'textbox',
  'combobox',
  'listbox',
  'searchbox',
  'spinbutton',
]

const MULTI_VALUE_ROLES = ['combobox', 'listbox', 'menu', 'radiogroup']

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

  const handleChangeExpected = (
    expected: LocatorToHaveValueAction['expected']
  ) => {
    onChange({ ...action, expected })
  }

  const suggestedRoles =
    action.expected.current === 'single'
      ? SINGLE_VALUE_ROLES
      : MULTI_VALUE_ROLES

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
        suggestedRoles={suggestedRoles}
        onChange={handleChangeLocator}
      />
      to have {action.expected.current === 'single' ? 'value' : 'values'}
      <ToHaveValuesForm
        expected={action.expected}
        onChange={handleChangeExpected}
      />
    </Grid>
  )
}
