import { zodResolver } from '@hookform/resolvers/zod'
import { Button, IconButton, TextField, Text, Tooltip } from '@radix-ui/themes'
import { Trash2Icon } from 'lucide-react'
import { useCallback, useEffect } from 'react'
import {
  useForm,
  useFieldArray,
  FieldArrayWithId,
  UseFormRegister,
  FieldErrors,
  UseFieldArrayRemove,
} from 'react-hook-form'

import { FieldGroup } from '@/components/Form'
import { Table } from '@/components/Table'
import { TestDataSchema } from '@/schemas/generator'
import { useGeneratorStore } from '@/store/generator'
import { TestData } from '@/types/testData'

export function VariablesEditor() {
  const variables = useGeneratorStore((store) => store.variables)
  const setVariables = useGeneratorStore((store) => store.setVariables)

  const {
    handleSubmit,
    register,
    control,
    watch,
    formState: { errors },
  } = useForm<Pick<TestData, 'variables'>>({
    resolver: zodResolver(TestDataSchema.pick({ variables: true })),
    shouldFocusError: false,
    defaultValues: { variables },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variables',
  })

  const watchVariables = watch('variables')

  const onSubmit = useCallback(
    (data: Pick<TestData, 'variables'>) => {
      setVariables(data.variables)
    },
    [setVariables]
  )

  // Submit onChange
  useEffect(() => {
    const subscription = watch(() => handleSubmit(onSubmit)())
    return () => subscription.unsubscribe()
  }, [watch, handleSubmit, onSubmit])

  function handleAddVariable() {
    append({ name: `variable_${watchVariables.length}`, value: '' })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Text size="2" as="p" mb="2">
        Define variables and use them in your test rules.
      </Text>
      <Table.Root size="1" variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell width="30%">Name</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Value (string)</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width="0"></Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {fields.map((field, index) => (
            <VariableRow
              key={field.id}
              field={field}
              index={index}
              register={register}
              errors={errors}
              onRemove={remove}
            />
          ))}
          <Table.Row>
            <Table.RowHeaderCell colSpan={3} justify="center">
              <Button variant="ghost" onClick={handleAddVariable}>
                Add variable
              </Button>
            </Table.RowHeaderCell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
    </form>
  )
}

interface VariableRowProps {
  field: FieldArrayWithId<Pick<TestData, 'variables'>, 'variables', 'id'>
  index: number
  register: UseFormRegister<Pick<TestData, 'variables'>>
  errors: FieldErrors<Pick<TestData, 'variables'>>
  onRemove: UseFieldArrayRemove
}

function VariableRow({
  field,
  index,
  errors,
  register,
  onRemove,
}: VariableRowProps) {
  const isVariableInUse = useGeneratorStore((state) =>
    state.rules.some(
      (rule) =>
        rule.type === 'parameterization' &&
        rule.value.type === 'variable' &&
        rule.value.variableName === field.name
    )
  )

  return (
    <Table.Row>
      <Table.Cell maxWidth="400px">
        <FieldGroup errors={errors} name={`variables.${index}.name`} mb="0">
          <TextField.Root
            placeholder="name"
            disabled={isVariableInUse}
            {...register(`variables.${index}.name`)}
          />
        </FieldGroup>
      </Table.Cell>
      <Table.Cell>
        <FieldGroup errors={errors} name={`variables.${index}.value`} mb="0">
          <TextField.Root
            placeholder="value"
            {...register(`variables.${index}.value`)}
          />
        </FieldGroup>
      </Table.Cell>
      <Table.Cell>
        <Tooltip
          content="Variable is referenced in a rule"
          hidden={!isVariableInUse}
        >
          <IconButton
            aria-label="Remove"
            disabled={isVariableInUse}
            onClick={() => onRemove(index)}
          >
            <Trash2Icon />
          </IconButton>
        </Tooltip>
      </Table.Cell>
    </Table.Row>
  )
}
