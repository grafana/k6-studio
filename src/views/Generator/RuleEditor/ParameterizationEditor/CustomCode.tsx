import { Controller, useFormContext } from 'react-hook-form'

import { FieldGroup } from '@/components/Form'
import { ConstrainedCodeEditor } from '@/components/Monaco/ConstrainerCodeEditor'
import { getCustomCodeSnippet } from '@/rules/parameterization'
import { selectSelectedRuleIndex, useGeneratorStore } from '@/store/generator'
import { ParameterizationRule } from '@/types/rules'

export function CustomCode() {
  const {
    control,
    formState: { errors },
  } = useFormContext<ParameterizationRule>()
  const ruleIndex = useGeneratorStore(selectSelectedRuleIndex)

  return (
    <FieldGroup name="value.code" errors={errors} label="Snippet">
      <Controller
        name="value.code"
        control={control}
        render={({ field }) => (
          <div css={{ height: 200 }}>
            <ConstrainedCodeEditor
              value={getCustomCodeSnippet(
                valueWithFallback(field.value),
                ruleIndex
              )}
              onChange={field.onChange}
              editableRange={getEditableRanges(valueWithFallback(field.value))}
              options={{ wordWrap: 'on' }}
            />
          </div>
        )}
      />
    </FieldGroup>
  )
}

function valueWithFallback(value?: string) {
  return (
    value ?? '  // Enter your code here, make sure to add a return statement'
  )
}

function getEditableRanges(value?: string) {
  const lines = (value ?? '').split('\n')
  const lastLine = lines[lines.length - 1] ?? '1'
  const startLine = 2 // Skip the first line with the function declaration
  const startColumn = 1
  const endLine = lines.length + 1
  const endColumn = lastLine.length + 1

  return [startLine, startColumn, endLine, endColumn]
}
