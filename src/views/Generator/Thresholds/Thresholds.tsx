import { ThresholdDataSchema } from '@/schemas/generator'
import { useGeneratorStore } from '@/store/generator'
import { Threshold, ThresholdData } from '@/types/thresholds'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Text } from '@radix-ui/themes'
import { useCallback, useEffect } from 'react'
import { useForm, useFieldArray, FormProvider } from 'react-hook-form'
import { ThresholdRow } from './ThresholdRow'
import { Table } from '@/components/Table'

export function Thresholds() {
  const thresholds = useGeneratorStore((store) => store.thresholds)

  const formMethods = useForm<{ thresholds: Threshold[] }>({
    resolver: zodResolver(ThresholdDataSchema),
    shouldFocusError: false,
    defaultValues: {
      thresholds,
    },
  })

  const { handleSubmit, control, watch } = formMethods

  const { append, remove, fields } = useFieldArray<ThresholdData>({
    control,
    name: 'thresholds',
  })

  function handleAddThreshold(event: React.MouseEvent) {
    event.preventDefault()

    append({
      id: crypto.randomUUID(),
      url: '*',
      metric: 'http_req_duration',
      statistic: 'avg',
      condition: '>',
      value: 0,
      stopTest: false,
    })
  }

  const onSubmit = useCallback((data: ThresholdData) => {
    console.log('onSubmit', data)
  }, [])

  // Submit onChange
  useEffect(() => {
    const subscription = watch(() => handleSubmit(onSubmit)())
    return () => subscription.unsubscribe()
  }, [watch, handleSubmit, onSubmit])

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Text size="2" as="p" mb="4">
          Define pass/fail criteria for your test metrics. If the performance of
          the system under test does not meet the conditions, the test finishes
          with a failed status.
        </Text>
        <Table.Root size="1" variant="surface" layout="fixed">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell width="70px">
                Metric
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width="70px">URL</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width="60px">
                Statistic
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width="40px">
                Condition
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width="45px">
                Value
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width="20px">Stop</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width="0"></Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {fields.map((field, index) => (
              <ThresholdRow
                key={field.id}
                field={field}
                index={index}
                remove={remove}
              />
            ))}

            <Table.Row>
              <Table.RowHeaderCell colSpan={7} justify="center">
                <Button variant="ghost" onClick={handleAddThreshold}>
                  Add threshold
                </Button>
              </Table.RowHeaderCell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </form>
    </FormProvider>
  )
}
