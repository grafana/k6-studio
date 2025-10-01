import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Text } from '@radix-ui/themes'
import { useCallback, useEffect } from 'react'
import { useForm, useFieldArray, FormProvider } from 'react-hook-form'

import { ExternalLink } from '@/components/ExternalLink'
import { Table } from '@/components/Table'
import { ThresholdDataSchema } from '@/schemas/generator'
import { useGeneratorStore } from '@/store/generator'
import { Threshold, ThresholdData } from '@/types/testOptions'

import { ThresholdRow } from './ThresholdRow'

export function Thresholds() {
  const thresholds = useGeneratorStore((store) => store.thresholds)
  const setThresholds = useGeneratorStore((store) => store.setThresholds)

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
      metric: 'http_req_duration',
      statistic: 'avg',
      condition: '<',
      value: 0,
      stopTest: false,
    })
  }

  const onSubmit = useCallback(
    (data: ThresholdData) => {
      setThresholds(data.thresholds)
    },
    [setThresholds]
  )

  // Submit onChange
  useEffect(() => {
    const subscription = watch(() => handleSubmit(onSubmit)())
    return () => subscription.unsubscribe()
  }, [watch, handleSubmit, onSubmit])

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Text size="2" as="p" mb="4">
          Define pass/fail criteria for your test metrics across all URLs. Learn
          more about thresholds in the{' '}
          <ExternalLink href="https://grafana.com/docs/k6/latest/using-k6/thresholds">
            docs
          </ExternalLink>
          .
        </Text>
        <Table.Root size="1" variant="surface" layout="fixed">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell width="210px">
                Metric
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width="160px">
                Statistic
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width="100px">
                Condition
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width="145px">
                Value
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width="80px">
                Stop Test
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width="59px"></Table.ColumnHeaderCell>
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
