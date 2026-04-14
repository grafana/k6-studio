import { Grid } from '@radix-ui/themes'

import { LocatorUncheckAction } from '@/main/runner/schema'

import { LocatorForm } from '../../ActionForms/forms/LocatorForm'
import { WithEditorMetadata } from '../../types'

const UNCHECK_ROLES = ['checkbox', 'radio', 'switch']

interface UncheckActionBodyProps {
  action: WithEditorMetadata<LocatorUncheckAction>
  onChange: (action: WithEditorMetadata<LocatorUncheckAction>) => void
}

export function UncheckActionBody({
  action,
  onChange,
}: UncheckActionBodyProps) {
  const handleChangeLocator = (
    locator: WithEditorMetadata<LocatorUncheckAction>['locator']
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
      Uncheck input
      <LocatorForm state={action.locator} suggestedRoles={UNCHECK_ROLES} onChange={handleChangeLocator} />
    </Grid>
  )
}
