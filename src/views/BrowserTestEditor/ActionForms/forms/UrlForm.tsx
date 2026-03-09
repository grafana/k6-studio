import { useState } from 'react'

import { FieldRenderer } from '../../ActionForms'
import { urlField } from '../../ActionForms/fields'
import { buildFieldErrors } from '../../ActionForms/utils'
import { FormPopover } from '../components/FormPopover'

interface UrlFormProps {
  value: string
  onChange: (value: string) => void
}

export function UrlForm({ value, onChange }: UrlFormProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [isTouched, setIsTouched] = useState(false)

  const errorMessage = isTouched ? urlField.validate?.(value) : undefined

  return (
    <FormPopover
      open={isPopoverOpen}
      displayValue={value || 'Enter URL'}
      error={errorMessage}
      onOpenChange={(open) => {
        setIsPopoverOpen(open)
        if (!open) {
          setIsTouched(true)
        }
      }}
    >
      <FieldRenderer
        field={urlField}
        model={value}
        onChange={onChange}
        onBlur={() => setIsTouched(true)}
        errors={buildFieldErrors('url', errorMessage)}
      />
    </FormPopover>
  )
}
