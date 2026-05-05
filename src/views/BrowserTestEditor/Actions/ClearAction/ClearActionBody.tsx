import { Grid } from '@radix-ui/themes'

import { LocatorClearAction } from '@/main/runner/schema'

import { LocatorForm } from '../../ActionForms/forms/LocatorForm'
import { WithEditorMetadata } from '../../types'

const CLEAR_ROLES = ['textbox', 'searchbox', 'combobox']

interface ClearActionBodyProps {
  action: WithEditorMetadata<LocatorClearAction>
  onChange: (action: WithEditorMetadata<LocatorClearAction>) => void
}

export function ClearActionBody({ action, onChange }: ClearActionBodyProps) {
  const handleChangeLocator = (
    locator: WithEditorMetadata<LocatorClearAction>['locator']
  ) => {
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
