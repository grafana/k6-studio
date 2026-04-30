import { Button, Text } from '@radix-ui/themes'
import { isEqual } from 'lodash-es'
import { createContext, useCallback, useEffect } from 'react'
import { FormProvider, Resolver, useForm, useFieldArray } from 'react-hook-form'

import { ExternalLink } from '@/components/ExternalLink'
import { Table } from '@/components/Table'

import { ThresholdRow } from './ThresholdRow'
import type { ThresholdLikeRow } from './Thresholds.utils'
import { MetricsConfig } from './createMetricsConfig'

interface ThresholdsProps<M extends string> {
  value: Array<ThresholdLikeRow & { metric: M }>
  onChange: (next: Array<ThresholdLikeRow & { metric: M }>) => void
  metricsConfig: MetricsConfig<M>
  // Resolver is contravariant in TFieldValues so callers with narrower schemas
  // cannot assign to a concrete form type. Use any to accept all resolvers.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolver?: Resolver<any>
}

export const MetricsConfigContext = createContext<MetricsConfig<string> | null>(
  null
)

export function Thresholds<M extends string>({
  value,
  onChange,
  metricsConfig,
  resolver,
}: ThresholdsProps<M>) {
  type Row = ThresholdLikeRow & { metric: M }

  const formMethods = useForm<{ thresholds: Row[] }>({
    shouldFocusError: false,
    defaultValues: { thresholds: value },
    resolver: resolver as Resolver<{ thresholds: Row[] }> | undefined,
  })

  const { handleSubmit, control, watch, reset, getValues } = formMethods

  // Keep form synced when external value changes (e.g. dialog reopened)
  useEffect(() => {
    const current = getValues('thresholds')
    if (!isEqual(current, value)) {
      reset({ thresholds: value })
    }
  }, [value, reset, getValues])

  const { append, remove, fields } = useFieldArray({
    control,
    name: 'thresholds',
  })

  const onSubmit = useCallback(
    (data: { thresholds: Row[] }) => {
      onChange(data.thresholds)
    },
    [onChange]
  )

  useEffect(() => {
    const subscription = watch(() => handleSubmit(onSubmit)())
    return () => subscription.unsubscribe()
  }, [watch, handleSubmit, onSubmit])

  function handleAddThreshold(event: React.MouseEvent) {
    event.preventDefault()

    const firstMetric = metricsConfig.options[0]?.value as M
    const firstStatistic =
      metricsConfig.getStatisticOptions(firstMetric)[0]?.value

    if (firstMetric === undefined || firstStatistic === undefined) {
      return
    }

    const newRow: Row = {
      id: crypto.randomUUID(),
      metric: firstMetric,
      statistic: firstStatistic,
      condition: '<',
      value: 0,
      stopTest: false,
    }
    append(newRow)
  }

  return (
    <MetricsConfigContext.Provider
      value={metricsConfig as unknown as MetricsConfig<string>}
    >
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Text size="2" as="p" mb="4">
            Define pass/fail criteria for your test metrics across all URLs.
            Learn more about thresholds in the{' '}
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
                <Table.ColumnHeaderCell width="59px" />
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
    </MetricsConfigContext.Provider>
  )
}
