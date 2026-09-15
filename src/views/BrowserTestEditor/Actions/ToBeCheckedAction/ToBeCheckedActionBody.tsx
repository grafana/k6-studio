import { Grid } from '@radix-ui/themes'

import { LocatorToBeCheckedAction } from '@/schemas/browserTest'

import { CheckedStateForm } from '../../ActionForms/forms/CheckedStateForm'
import { LocatorForm } from '../../ActionForms/forms/LocatorForm'

const CHECKED_ROLES = ['checkbox', 'radio', 'switch']

interface ToBeCheckedActionBodyProps {
  action: LocatorToBeCheckedAction
  onChange: (action: LocatorToBeCheckedAction) => void
}

export function ToBeCheckedActionBody({
  action,
  onChange,
}: ToBeCheckedActionBodyProps) {
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
        action={action}
        suggestedRoles={CHECKED_ROLES}
        onChange={onChange}
      />
      to be
      <CheckedStateForm value={action.checked} onChange={handleChangeChecked} />
    </Grid>
  )
}
