import { Box, Button, Flex } from '@radix-ui/themes'
import { useFormContext, useFieldArray } from 'react-hook-form'

import { Table } from '@/components/Table'
import { LoadProfileExecutorOptions } from '@/types/testOptions'

import { Stage } from './Stage'

export function VUStages() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<LoadProfileExecutorOptions>()

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'stages',
  })

  return (
    <Flex direction="column" gap="2">
      <Table.Root size="1" variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell width="30%">
              Target VUs
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Duration</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width="0"></Table.ColumnHeaderCell>
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
          <Table.Row>
            <Table.RowHeaderCell colSpan={3} justify="center">
              <Box>
                <Button
                  variant="ghost"
                  onClick={() => append({ target: 20, duration: '1m' })}
                >
                  Add stage
                </Button>
              </Box>
            </Table.RowHeaderCell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
    </Flex>
  )
}
