import { Grid } from '@radix-ui/themes'

import { LocatorForm } from '../../ActionForms/forms/LocatorForm'
import { BrowserActionInstance } from '../../types'

type Action = Extract<BrowserActionInstance, { method: 'locator.click' }>

interface ClickActionBodyProps {
  action: Action
  onChange: (action: Action) => void
}

export function ClickActionBody({ action, onChange }: ClickActionBodyProps) {
  const handleChangeLocator = (locator: Action['locator']) => {
    onChange({ ...action, locator })
  }

  return (
    <Grid
      columns="max-content minmax(0, max-content) 1fr"
      gap="2"
      align="center"
      width="100%"
    >
      Click
      <LocatorForm state={action.locator} onChange={handleChangeLocator} />
    </Grid>
  )
}
