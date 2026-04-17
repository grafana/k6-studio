import { css } from '@emotion/react'
import { Grid } from '@radix-ui/themes'

import { LocatorForm } from '../../ActionForms/forms/LocatorForm'
import { WaitForOptionsForm } from '../../ActionForms/forms/WaitForOptionsForm'
import { BrowserActionInstance } from '../../types'

type Action = Extract<BrowserActionInstance, { method: 'locator.waitFor' }>

interface WaitForActionBodyProps {
  action: Action
  onChange: (action: Action) => void
}

export function WaitForActionBody({
  action,
  onChange,
}: WaitForActionBodyProps) {
  const handleChangeLocator = (locator: Action['locator']) => {
    onChange({
      ...action,
      locator,
    })
  }

  const handleChangeOptions = (options: Partial<Action>['options']) => {
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
      Wait for
      <LocatorForm state={action.locator} onChange={handleChangeLocator} />
      <WaitForOptionsForm
        options={action.options}
        onChange={handleChangeOptions}
      />
    </Grid>
  )
}
