import { Grid } from '@radix-ui/themes'

import { LocatorToBeCheckedAction } from '@/schemas/browserTest'

import { CheckedStateForm } from '../../ActionForms/forms/CheckedStateForm'
import { LocatorForm } from '../../ActionForms/forms/LocatorForm'
import { WithEditorMetadata } from '../../types'

const CHECKED_ROLES = ['checkbox', 'radio', 'switch']

interface ToBeCheckedActionBodyProps {
  action: WithEditorMetadata<LocatorToBeCheckedAction>
  onChange: (action: WithEditorMetadata<LocatorToBeCheckedAction>) => void
}

export function ToBeCheckedActionBody({
  action,
  onChange,
}: ToBeCheckedActionBodyProps) {
  const handleChangeLocator = (
    locator: WithEditorMetadata<LocatorToBeCheckedAction>['locator']
  ) => {
    onChange({ ...action, locator })
  }

  const handleChangeChecked = (checked: boolean) => {
    onChange({ ...action, checked })
  }

  return (
    <Grid
      columns="max-content minmax(0, max-content) max-content max-content 1fr"
      gap="2"
      align="center"
      width="100%"
    >
      Expect
      <LocatorForm
        state={action.locator}
        suggestedRoles={CHECKED_ROLES}
        onChange={handleChangeLocator}
      />
      to be
      <CheckedStateForm value={action.checked} onChange={handleChangeChecked} />
    </Grid>
  )
}
