import { TextField } from '@radix-ui/themes'
import { useFormContext } from 'react-hook-form'

import { FieldGroup } from '@/components/Form'
import { TestRule } from '@/types/rules'

export function FilterField({
  field,
}: {
  field: 'filter' | 'extractor.filter' | 'replacer.filter'
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext<TestRule>()
  const fieldName = `${field}.path` as const

  return (
    <FieldGroup
      name={fieldName}
      label="Filter"
      hint="Filter requests by URL (regex supported)"
      errors={errors}
    >
      <TextField.Root
        placeholder="Filter by URL"
        css={{ marginBottom: 'var(--space-2)' }}
        id={fieldName}
        {...register(fieldName)}
      />
    </FieldGroup>
  )
}
