import { Grid } from '@radix-ui/themes'

import { LocatorToContainTextAction } from '@/schemas/browserTest'

import { FillValueForm } from '../../ActionForms/forms/FillValueForm'
import { LocatorForm } from '../../ActionForms/forms/LocatorForm'

interface ToContainTextActionBodyProps {
  action: LocatorToContainTextAction
  onChange: (action: LocatorToContainTextAction) => void
}

export function ToContainTextActionBody({
  action,
  onChange,
}: ToContainTextActionBodyProps) {
  const handleChangeExpected = (expected: string) => {
    onChange({ ...action, expected })
  }

  return (
    <Grid
      columns="max-content minmax(0, max-content) max-content 1fr"
      gap="2"
      align="center"
      width="100%"
    >
      Expect
      <LocatorForm action={action} onChange={onChange} />
      to contain text
      <FillValueForm value={action.expected} onChange={handleChangeExpected} />
    </Grid>
  )
}
