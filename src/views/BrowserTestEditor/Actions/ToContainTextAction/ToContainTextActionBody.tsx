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
  const handleChangeLocator = (
    locator: LocatorToContainTextAction['locator']
  ) => {
    onChange({ ...action, locator })
  }

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
      <LocatorForm state={action.locator} onChange={handleChangeLocator} />
      to contain text
      <FillValueForm value={action.expected} onChange={handleChangeExpected} />
    </Grid>
  )
}
