import { useCallback, useEffect } from 'react'
import { TrashIcon } from '@radix-ui/react-icons'
import { Button, IconButton, TextField, Text, Code } from '@radix-ui/themes'
import { useGeneratorStore } from '@/store/generator'
import { useForm, useFieldArray } from 'react-hook-form'
import { TestData } from '@/types/testData'
import { zodResolver } from '@hookform/resolvers/zod'
import { TestDataSchema } from '@/schemas/testData'
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
            <Table.Row key={field.id}>
              <Table.Cell maxWidth="400px">
                <FieldGroup
                  errors={errors}
                  name={`variables.${index}.name`}
                  mb="0"
                >
                  <TextField.Root
                    placeholder="name"
                    {...register(`variables.${index}.name`)}
                  />
                </FieldGroup>
              </Table.Cell>
              <Table.Cell>
                <FieldGroup
                  errors={errors}
                  name={`variables.${index}.value`}
                  mb="0"
                >
                  <TextField.Root
                    placeholder="value"
                    {...register(`variables.${index}.value`)}
                  />
                </FieldGroup>
              </Table.Cell>
              <Table.Cell>
                <IconButton onClick={() => remove(index)}>
                  <TrashIcon width="18" height="18" />
                </IconButton>
              </Table.Cell>
            </Table.Row>
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
