import { FieldGroup } from '@/components/Form'
import { CodeEditor } from '@/components/Monaco/CodeEditor'
import { ConstrainedCodeEditor } from '@/components/Monaco/ConstrainerCodeEditor'
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
            <ConstrainedCodeEditor
              value={wrapValue(field.value) ?? ''}
              onChange={(value = '') => {
                field.onChange(value)
              }}
              range={getEditableRanges(field.value)}
            />
          </div>
        )}
      />
    </FieldGroup>
  )
}

function wrapValue(value?: string) {
  return `function getParameterizationValue0() {
${value ?? ''}
}`
}

function getEditableRanges(value?: string) {
  const lines = (value ?? '').split('\n')
  const lastLine = lines[lines.length - 1] ?? '1'
  const startLine = 2 // function definition on first line
  const startColumn = 1
  const endLine = lines.length + 1
  const endColumn = lastLine.length + 1

  return {
    range: [startLine, startColumn, endLine, endColumn],
    allowMultiline: true,
    label: 'range',
  }
}
