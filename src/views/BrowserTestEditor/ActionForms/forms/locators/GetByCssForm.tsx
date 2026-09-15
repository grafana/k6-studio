import { css } from '@emotion/react'
import { TextArea } from '@radix-ui/themes'

import { FieldGroup } from '@/components/Form'
import { ElementLocator, CssLocator } from '@/schemas/locator'

import { toFieldErrors } from '../utils'

import { FieldErrors } from './validation'

interface GetByCssFormProps {
  locator: CssLocator | undefined
  isTouched: boolean
  errors: FieldErrors['css'] | undefined
  onChange: (locator: ElementLocator) => void
  onBlur?: () => void
}

export function GetByCssForm({
  locator = { type: 'css', selector: '' },
  isTouched,
  errors,
  onChange,
  onBlur,
}: GetByCssFormProps) {
  return (
    <FieldGroup
      name="css-selector"
      label="CSS selector"
      labelSize="1"
      mb="0"
      errors={toFieldErrors('css-selector', isTouched && errors?.selector)}
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
