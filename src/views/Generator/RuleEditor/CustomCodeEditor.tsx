import { Box, Grid } from '@radix-ui/themes'
import { Controller, useFormContext } from 'react-hook-form'

import { ControlledSelect, FieldGroup } from '@/components/Form'
import { CodeEditor } from '@/components/Monaco/CodeEditor'

import { FilterField } from './FilterField'

const PLACEMENT_OPTIONS = [
  { value: 'before', label: 'Before matched requests' },
  { value: 'after', label: 'After matched requests' },
]

export function CustomCodeEditor() {
  const {
    control,
    formState: { errors },
  } = useFormContext()
  return (
    <Box>
      <Grid gap="2" columns="1fr 1fr">
        <FilterField field="filter" />
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
                // TODO: https://github.com/grafana/k6-studio/issues/277
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
