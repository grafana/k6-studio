import { Grid } from '@radix-ui/themes'

import { LocatorSelectOptionAction } from '@/main/runner/schema'

import { LocatorForm } from '../../ActionForms/forms/LocatorForm'
import { SelectOptionValuesForm } from '../../ActionForms/forms/SelectOptionValuesForm'
import { WithEditorMetadata } from '../../types'

interface SelectOptionActionBodyProps {
  action: WithEditorMetadata<LocatorSelectOptionAction>
  onChange: (action: WithEditorMetadata<LocatorSelectOptionAction>) => void
}

export function SelectOptionActionBody({
  action,
  onChange,
}: SelectOptionActionBodyProps) {
  const handleChangeLocator = (
    locator: WithEditorMetadata<LocatorSelectOptionAction>['locator']
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
      <LocatorForm
        state={action.locator}
        onChange={handleChangeLocator}
        suggestedRoles={['combobox', 'listbox']}
      />
      with
      <SelectOptionValuesForm
        values={action.values}
        onChange={handleChangeValues}
      />
    </Grid>
  )
}
