import { Grid } from '@radix-ui/themes'

import { LocatorClickAction } from '@/main/runner/schema'

import { LocatorForm } from '../../ActionForms/forms/LocatorForm'
import { WithEditorMetadata } from '../../types'

interface ClickActionBodyProps {
  action: WithEditorMetadata<LocatorClickAction>
  onChange: (action: WithEditorMetadata<LocatorClickAction>) => void
}

export function ClickActionBody({ action, onChange }: ClickActionBodyProps) {
  const handleChangeLocator = (
    locator: WithEditorMetadata<LocatorClickAction>['locator']
  ) => {
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
