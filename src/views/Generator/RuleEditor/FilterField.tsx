import { TextField } from '@radix-ui/themes'

import { TestRule } from '@/types/rules'
import { useFormContext } from 'react-hook-form'
import { FieldGroup } from '@/components/Form'

export function FilterField({
  path: path,
}: {
  path: 'filter' | 'extractor.filter' | 'replacer.filter'
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext<TestRule>()
  const fieldName = `${path}.path` as const

  return (
    <FieldGroup
      name={fieldName}
      label="Filter"
      hint="Only requests with this string in their path will be affected. Regex supported."
      errors={errors}
    >
      <TextField.Root
        placeholder="Filter by path"
        css={{ marginBottom: 'var(--space-2)' }}
        id={fieldName}
        {...register(fieldName)}
      />
    </FieldGroup>
  )
}
