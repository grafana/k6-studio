import { Box, Flex, Heading, Text, TextField } from '@radix-ui/themes'

import { FieldGroup } from '@/views/Generator/GeneratorDrawer/ThinkTime'
import { useFormContext } from 'react-hook-form'
import { stringAsOptionalNumber } from '@/utils/form'

export function SharedIterations() {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  return (
    <Flex direction="column" gap="2">
      <Heading color="gray" mb="1" size="3">
        Shared Iterations
      </Heading>
      <Text size="2">
        A fixed number of iterations are {'"shared"'} between a number of VUs,
        and the test ends once all iterations are executed.
      </Text>

      <Flex gap="2">
        <Box width="50%">
          <FieldGroup
            label="VUs"
            hint="Number of VUs to run concurrently."
            errors={errors}
            name="vus"
          >
            <TextField.Root
              type="number"
              placeholder="20"
              {...register('vus', {
                setValueAs: stringAsOptionalNumber,
              })}
            />
          </FieldGroup>
        </Box>

        <Box width="50%">
          <FieldGroup
            label="Iterations"
            hint="Total number of script iterations to execute across all VUs."
            errors={errors}
            name="iterations"
          >
            <TextField.Root
              type="number"
              placeholder="200"
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
