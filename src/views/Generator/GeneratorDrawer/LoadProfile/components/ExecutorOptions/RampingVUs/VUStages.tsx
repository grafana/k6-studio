import { Box, Button, Flex, Table } from '@radix-ui/themes'

import { Stage } from './Stage'
import { LoadProfileExecutorOptions } from '@/types/testOptions'
import { useFormContext, useFieldArray } from 'react-hook-form'

export function VUStages() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<LoadProfileExecutorOptions>()
  const { fields, append, remove } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormProvider)
    name: 'stages', // unique name for your Field Array
  })

  return (
    <Flex direction="column" gap="2">
      <Table.Root size="1" variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Target VUs</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Duration</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {fields.map((stage, index) => (
            <Table.Row key={index}>
              <Stage
                key={stage.id}
                index={index}
                register={register}
                handleRemove={() => remove(index)}
                errors={errors}
              />
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      <Box p="2">
        <Button
          variant="ghost"
          onClick={() => append({ target: 20, duration: '1m' })}
        >
          Add new stage
        </Button>
      </Box>
    </Flex>
  )
}
