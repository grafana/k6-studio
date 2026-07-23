import { Grid } from '@radix-ui/themes'

import { LocatorUncheckAction } from '@/schemas/browserTest'

import { LocatorForm } from '../../ActionForms/forms/LocatorForm'

const UNCHECK_ROLES = ['checkbox', 'radio', 'switch']

interface UncheckActionBodyProps {
  action: LocatorUncheckAction
  onChange: (action: LocatorUncheckAction) => void
}

export function UncheckActionBody({
  action,
  onChange,
}: UncheckActionBodyProps) {
  return (
    <Grid
      columns="max-content minmax(0, max-content) 1fr"
      gap="2"
      align="center"
      width="100%"
    >
      Uncheck input
      <LocatorForm
        action={action}
        suggestedRoles={UNCHECK_ROLES}
        onChange={onChange}
      />
    </Grid>
  )
}
