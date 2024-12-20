import { useCallback, useEffect } from 'react'
import { TrashIcon } from '@radix-ui/react-icons'
import {
  Button,
  IconButton,
  TextField,
  Text,
  Code,
  Tooltip,
} from '@radix-ui/themes'
import { useGeneratorStore } from '@/store/generator'
import {
  useForm,
  useFieldArray,
  FieldArrayWithId,
  UseFormRegister,
  FieldErrors,
  UseFieldArrayRemove,
} from 'react-hook-form'
import { TestData } from '@/types/testData'
import { zodResolver } from '@hookform/resolvers/zod'
import { TestDataSchema } from '@/schemas/generator'
import { FieldGroup } from '@/components/Form'
import { Table } from '@/components/Table'

export function VariablesEditor() {
  const variables = useGeneratorStore((store) => store.variables)
  const setVariables = useGeneratorStore((store) => store.setVariables)

  const {
    handleSubmit,
    register,
    control,
    watch,
    formState: { errors },
  } = useForm<TestData>({
    resolver: zodResolver(TestDataSchema),
    shouldFocusError: false,
    defaultValues: {
      variables,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variables',
  })

  const watchVariables = watch('variables')

  const onSubmit = useCallback(
    (data: TestData) => {
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
        Define custom variables and use them in your custom code rules, for
        example:
        <Code>{'VARS["variable_0"]'}</Code>.
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
              remove={remove}
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

function VariableRow({
  field,
  index,
  errors,
  register,
  remove,
}: {
  field: FieldArrayWithId<TestData, 'variables', 'id'>
  index: number
  register: UseFormRegister<TestData>
  errors: FieldErrors<TestData>
  remove: UseFieldArrayRemove
}) {
  const isVariableInUse = useGeneratorStore((state) =>
    state.rules.some(
      (rule) =>
        rule.type === 'parameterization' &&
        rule.value.type === 'variable' &&
        rule.value.variableName === field.name
    )
  )

  return (
    <Table.Row key={field.id}>
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
        <Tooltip content="Variable is in use by rule" hidden={!isVariableInUse}>
          <IconButton disabled={isVariableInUse} onClick={() => remove(index)}>
            <TrashIcon width="18" height="18" />
          </IconButton>
        </Tooltip>
      </Table.Cell>
    </Table.Row>
  )
}
