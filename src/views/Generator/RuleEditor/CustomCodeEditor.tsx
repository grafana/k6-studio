import { Box, Flex } from '@radix-ui/themes'

import { FilterField } from './FilterField'
import { CodeEditor } from '@/components/Monaco/CodeEditor'
import { Controller, useFormContext } from 'react-hook-form'
import { ControlledSelect, FieldGroup } from '@/components/Form'

const PLACEMENT_OPTIONS = [
  { value: 'before', label: 'Before request' },
  { value: 'after', label: 'After request' },
]

export function CustomCodeEditor() {
  const {
    control,
    formState: { errors },
  } = useFormContext()
  return (
    <Box>
      <Flex gap="2">
        <Box width="50%">
          <FilterField path="filter" />
        </Box>
        <Box width="50%">
          <FieldGroup name="placement" errors={errors} label="Placement">
            <ControlledSelect
              name="placement"
              control={control}
              options={PLACEMENT_OPTIONS}
            />
          </FieldGroup>
        </Box>
      </Flex>

      <FieldGroup name="snippet" errors={errors} label="Snippet">
        <Controller
          name="snippet"
          render={({ field }) => (
            <div css={{ height: 200 }}>
              <CodeEditor
                value={field.value}
                onChange={(value = '') => {
                  field.onChange(value)
                }}
              />
            </div>
          )}
        />
      </FieldGroup>
    </Box>
  )
}
