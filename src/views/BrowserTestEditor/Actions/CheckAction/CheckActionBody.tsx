import { Grid } from '@radix-ui/themes'

import { LocatorCheckAction } from '@/main/runner/schema'

import { LocatorForm } from '../../ActionForms/forms/LocatorForm'
import { WithEditorMetadata } from '../../types'

const CHECK_ROLES = ['checkbox', 'radio', 'switch']

interface CheckActionBodyProps {
  action: WithEditorMetadata<LocatorCheckAction>
  onChange: (action: WithEditorMetadata<LocatorCheckAction>) => void
}

export function CheckActionBody({ action, onChange }: CheckActionBodyProps) {
  const handleChangeLocator = (
    locator: WithEditorMetadata<LocatorCheckAction>['locator']
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
      Check input
      <LocatorForm
        state={action.locator}
        suggestedRoles={CHECK_ROLES}
        onChange={handleChangeLocator}
      />
    </Grid>
  )
}
