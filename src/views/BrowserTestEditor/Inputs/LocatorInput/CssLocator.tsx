import { css } from '@emotion/react'
import { TextArea } from '@radix-ui/themes'

import { FieldGroup } from '@/components/Form'
import { ActionLocator } from '@/main/runner/schema'

type CssLocator = Extract<ActionLocator, { type: 'css' }>

interface CssLocatorProps {
  locator: CssLocator
  onChange: (locator: CssLocator) => void
}

export function CssLocator({ locator, onChange }: CssLocatorProps) {
  return (
    <FieldGroup
      name="css-selector"
      label="CSS selector"
      labelSize="1"
      mb="0"
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
      />
    </FieldGroup>
  )
}
