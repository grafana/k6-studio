import { Box, Grid, Separator, Text } from '@radix-ui/themes'
import { useFormContext } from 'react-hook-form'

import { ControlledSelect, FieldGroup } from '@/components/Form'
import { VerificationRule } from '@/types/rules'

import { FilterField } from '../FilterField'

import { ValueEditor } from './ValueEditor'

const TARGET_OPTIONS = [
  { value: 'status', label: 'Status code' },
  { value: 'body', label: 'Response body' },
]

export function VerificationEditor() {
  const {
    control,
    formState: { errors },
  } = useFormContext<VerificationRule>()

  return (
    <>
      <Text size="2" as="p" mb="2" color="gray">
        Add verification checks to validate response data.
      </Text>
      <Grid columns="1fr auto 1fr" gap="4">
        <Box>
          <FilterField field="filter" />
          <FieldGroup name="target" errors={errors} label="Target">
            <ControlledSelect
              name="target"
              control={control}
              options={TARGET_OPTIONS}
            />
          </FieldGroup>
        </Box>
        <Separator orientation="vertical" size="4" decorative />
        <Box>
          <ValueEditor />
        </Box>
      </Grid>
    </>
  )
}
