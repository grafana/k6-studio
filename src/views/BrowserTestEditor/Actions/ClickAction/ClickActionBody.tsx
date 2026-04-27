import { css } from '@emotion/react'
import { Grid } from '@radix-ui/themes'

import { LocatorClickAction } from '@/main/runner/schema'

import { ClickOptionsForm } from '../../ActionForms/forms/ClickOptionsForm'
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

  const handleChangeOptions = (
    options: Partial<NonNullable<LocatorClickAction['options']>>
  ) => {
    onChange({
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
      Click
      <LocatorForm state={action.locator} onChange={handleChangeLocator} />
      <ClickOptionsForm
        options={action.options}
        onChange={handleChangeOptions}
      />
    </Grid>
  )
}
