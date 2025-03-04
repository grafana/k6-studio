import { Box, Grid, Text } from '@radix-ui/themes'
import { useFormContext } from 'react-hook-form'
import { ControlledSelect, FieldGroup } from '@/components/Form'
import { FilterField } from '../FilterField'
import { ValueEditor } from './ValueEditor'
import { VerificationRule } from '@/types/rules'

const TARGET_OPTIONS = [
  { value: 'status', label: 'Status code' },
  { value: 'body', label: 'Response body' },
]

const OPERATOR_OPTIONS = [
  { value: 'equals', label: 'Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'notContains', label: 'Does not contain' },
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
      <Grid columns="2" gap="3">
        <Box>
          <FilterField field="filter" />
          <FieldGroup name="target" errors={errors} label="Target">
            <ControlledSelect
              name="target"
              control={control}
              options={TARGET_OPTIONS}
            />
          </FieldGroup>
          <FieldGroup name="operator" errors={errors} label="Operator">
            <ControlledSelect
              name="operator"
              control={control}
              options={OPERATOR_OPTIONS}
            />
          </FieldGroup>
        </Box>
        <Box>
          <ValueEditor />
        </Box>
      </Grid>
    </>
  )
}
