import { Grid } from '@radix-ui/themes'

import { LocatorToBeVisibleAction } from '@/schemas/browserTest'

import { LocatorForm } from '../../ActionForms/forms/LocatorForm'
import { VisibilityStateForm } from '../../ActionForms/forms/VisibilityStateForm'

interface ToBeVisibleActionBodyProps {
  action: LocatorToBeVisibleAction
  onChange: (action: LocatorToBeVisibleAction) => void
}

export function ToBeVisibleActionBody({
  action,
  onChange,
}: ToBeVisibleActionBodyProps) {
  const handleChangeLocator = (
    locator: LocatorToBeVisibleAction['locator']
  ) => {
    onChange({ ...action, locator })
  }

  const handleChangeVisible = (visible: boolean) => {
    onChange({ ...action, visible })
  }

  return (
    <Grid
      columns="max-content minmax(0, max-content) max-content max-content 1fr"
      gap="2"
      align="center"
      width="100%"
    >
      Expect
      <LocatorForm state={action.locator} onChange={handleChangeLocator} />
      to be
      <VisibilityStateForm
        value={action.visible}
        onChange={handleChangeVisible}
      />
    </Grid>
  )
}
