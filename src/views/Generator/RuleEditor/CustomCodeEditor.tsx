import { Box, Grid } from '@radix-ui/themes'

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
      <Grid gap="2" columns="1fr 1fr">
        <FilterField path="filter" />
        <FieldGroup name="placement" errors={errors} label="Placement">
          <ControlledSelect
            name="placement"
            control={control}
            options={PLACEMENT_OPTIONS}
          />
        </FieldGroup>
      </Grid>

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
