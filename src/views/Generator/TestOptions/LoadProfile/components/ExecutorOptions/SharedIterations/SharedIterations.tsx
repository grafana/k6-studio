import { Box, Flex, Text, TextField } from '@radix-ui/themes'
import { useFormContext } from 'react-hook-form'

import { FieldGroup } from '@/components/Form'
import { stringAsOptionalNumber } from '@/utils/form'

export function SharedIterations() {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  return (
    <Flex direction="column" gap="2">
      <Text size="2">
        A fixed number of iterations are {'"shared"'} between a number of VUs,
        and the test ends once all iterations are executed.
      </Text>

      <Flex gap="2">
        <Box width="50%">
          <FieldGroup
            label="VUs"
            hint="Number of VUs to run concurrently"
            errors={errors}
            name="vus"
          >
            <TextField.Root
              type="number"
              min={0}
              placeholder="20"
              onKeyDown={(e) => {
                if (['-', '+', 'e'].includes(e.key)) {
                  e.preventDefault()
                }
              }}
              {...register('vus', {
                setValueAs: stringAsOptionalNumber,
              })}
            />
          </FieldGroup>
        </Box>

        <Box width="50%">
          <FieldGroup
            label="Iterations"
            hint="Total number of script iterations to execute across all VUs"
            errors={errors}
            name="iterations"
          >
            <TextField.Root
              type="number"
              min={0}
              placeholder="200"
              onKeyDown={(e) => {
                if (['-', '+', 'e'].includes(e.key)) {
                  e.preventDefault()
                }
              }}
              {...register('iterations', {
                setValueAs: stringAsOptionalNumber,
              })}
            />
          </FieldGroup>
        </Box>
      </Flex>
    </Flex>
  )
}
