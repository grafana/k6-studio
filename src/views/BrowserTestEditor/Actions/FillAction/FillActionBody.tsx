import { Grid } from '@radix-ui/themes'

import { LocatorFillAction } from '@/schemas/browserTest'

import { FillValueForm } from '../../ActionForms/forms/FillValueForm'
import { LocatorForm } from '../../ActionForms/forms/LocatorForm'

const FILL_ROLES = ['textbox', 'searchbox', 'combobox']

interface FillActionBodyProps {
  action: LocatorFillAction
  onChange: (action: LocatorFillAction) => void
}

export function FillActionBody({ action, onChange }: FillActionBodyProps) {
  const handleChangeValue = (value: string) => {
    onChange({ ...action, value })
  }

  return (
    <Grid
      columns="max-content minmax(0, max-content) minmax(0, max-content) 1fr"
      gap="2"
      align="center"
      width="100%"
    >
      Fill
      <LocatorForm
        action={action}
        onChange={onChange}
        suggestedRoles={FILL_ROLES}
      />
      with
      <FillValueForm value={action.value} onChange={handleChangeValue} />
    </Grid>
  )
}
