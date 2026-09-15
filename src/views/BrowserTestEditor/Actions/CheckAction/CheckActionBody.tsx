import { Grid } from '@radix-ui/themes'

import { LocatorCheckAction } from '@/schemas/browserTest'

import { LocatorForm } from '../../ActionForms/forms/LocatorForm'

const CHECK_ROLES = ['checkbox', 'radio', 'switch']

interface CheckActionBodyProps {
  action: LocatorCheckAction
  onChange: (action: LocatorCheckAction) => void
}

export function CheckActionBody({ action, onChange }: CheckActionBodyProps) {
  return (
    <Grid
      columns="max-content minmax(0, max-content) 1fr"
      gap="2"
      align="center"
      width="100%"
    >
      Check input
      <LocatorForm
        action={action}
        suggestedRoles={CHECK_ROLES}
        onChange={onChange}
      />
    </Grid>
  )
}
