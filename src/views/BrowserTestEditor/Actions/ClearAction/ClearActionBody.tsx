import { Grid } from '@radix-ui/themes'

import { LocatorClearAction } from '@/schemas/browserTest'

import { LocatorForm } from '../../ActionForms/forms/LocatorForm'

const CLEAR_ROLES = ['textbox', 'searchbox', 'combobox']

interface ClearActionBodyProps {
  action: LocatorClearAction
  onChange: (action: LocatorClearAction) => void
}

export function ClearActionBody({ action, onChange }: ClearActionBodyProps) {
  return (
    <Grid
      columns="max-content minmax(0, max-content) 1fr"
      gap="2"
      align="center"
      width="100%"
    >
      Clear
      <LocatorForm
        action={action}
        onChange={onChange}
        suggestedRoles={CLEAR_ROLES}
      />
    </Grid>
  )
}
