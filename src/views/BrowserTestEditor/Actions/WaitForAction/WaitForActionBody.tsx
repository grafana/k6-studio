import { css } from '@emotion/react'
import { Grid } from '@radix-ui/themes'

import { LocatorWaitForAction } from '@/main/runner/schema'

import { LocatorForm } from '../../ActionForms/forms/LocatorForm'
import { WaitForOptionsForm } from '../../ActionForms/forms/WaitForOptionsForm'
import { WithEditorMetadata } from '../../types'

interface WaitForActionBodyProps {
  action: WithEditorMetadata<LocatorWaitForAction>
  onUpdate: (action: WithEditorMetadata<LocatorWaitForAction>) => void
}

export function WaitForActionBody({
  action,
  onUpdate,
}: WaitForActionBodyProps) {
  const handleChangeLocator = (
    locator: WithEditorMetadata<LocatorWaitForAction>['locator']
  ) => {
    onUpdate({
      ...action,
      locator,
    })
  }

  const handleChangeOptions = (
    options: Partial<LocatorWaitForAction>['options']
  ) => {
    onUpdate({
      ...action,
      options: {
        ...action.options,
        ...options,
      },
    })
  }

  return (
    <Grid
      columns="max-content minmax(0, max-content) 1fr"
      gap="2"
      align="center"
      width="100%"
      css={css`
        > :last-child {
          justify-self: end;
        }
      `}
    >
      Wait for element
      <LocatorForm state={action.locator} onChange={handleChangeLocator} />
      <WaitForOptionsForm
        options={action.options}
        onChange={handleChangeOptions}
      />
    </Grid>
  )
}
