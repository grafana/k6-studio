import { css } from '@emotion/react'
import { TextArea } from '@radix-ui/themes'

import { FieldGroup } from '@/components/Form'
import { ActionLocator } from '@/main/runner/schema'

import { buildFieldErrors } from './LocatorInput.utils'

type CssLocator = Extract<ActionLocator, { type: 'css' }>

interface CssLocatorProps {
  locator: CssLocator
  onChange: (locator: CssLocator) => void
  onBlur?: () => void
  error?: string
}

export function CssLocator({
  locator,
  onChange,
  onBlur,
  error,
}: CssLocatorProps) {
  return (
    <FieldGroup
      name="css-selector"
      label="CSS selector"
      labelSize="1"
      mb="0"
      errors={buildFieldErrors('css-selector', error)}
      css={css`
        display: grid;
        height: 100%;
        grid-template-rows: auto 1fr;
      `}
    >
      <TextArea
        size="1"
        name="css-selector"
        css={css`
          height: 100%;
        `}
        value={locator.selector}
        onChange={(e) => onChange({ ...locator, selector: e.target.value })}
        onBlur={onBlur}
      />
    </FieldGroup>
  )
}
