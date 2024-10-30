import { FieldGroup } from '@/components/Form'
import { CodeEditor } from '@/components/Monaco/CodeEditor'
import { ParameterizationRule } from '@/types/rules'
import { Controller, useFormContext } from 'react-hook-form'

export function CustomCode() {
  const {
    control,
    formState: { errors },
  } = useFormContext<ParameterizationRule>()
  return (
    <FieldGroup name="snippet" errors={errors} label="Snippet">
      <Controller
        name="value.code"
        control={control}
        render={({ field }) => (
          <div css={{ height: 200 }}>
            <CodeEditor
              value={field.value ?? ''}
              onChange={(value = '') => {
                field.onChange(value)
              }}
            />
          </div>
        )}
      />
    </FieldGroup>
  )
}
