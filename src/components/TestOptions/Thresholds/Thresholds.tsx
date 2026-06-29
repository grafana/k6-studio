import { Button, Text } from '@radix-ui/themes'
import { useCallback, useMemo } from 'react'
import { FormProvider, Resolver, useFieldArray } from 'react-hook-form'

import { ExternalLink } from '@/components/ExternalLink'
import { Table } from '@/components/Table'

import { useControlledForm } from '../useControlledForm'

import { MetricsConfig } from './createMetricsConfig'
import { ThresholdRow } from './ThresholdRow'
import type { ThresholdLikeRow } from './Thresholds.utils'

interface ThresholdsProps<M extends string> {
  value: Array<ThresholdLikeRow & { metric: M }>
  onChange: (next: Array<ThresholdLikeRow & { metric: M }>) => void
  metricsConfig: MetricsConfig<M>
  /** Returns an annotation rendered beneath the row with the given threshold id. */
  getRowAnnotation?: (id: string) => string | undefined
  /** Hides the remove column; rows can only be toggled, not deleted. */
  hideRemove?: boolean
  // Resolver is contravariant in TFieldValues so callers with narrower schemas
  // cannot assign to a concrete form type. Use any to accept all resolvers.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolver?: Resolver<any>
}

export function Thresholds<M extends string>({
  value,
  onChange,
  metricsConfig,
  getRowAnnotation,
  hideRemove = false,
  resolver,
}: ThresholdsProps<M>) {
  const columnCount = hideRemove ? 6 : 7
  type Row = ThresholdLikeRow & { metric: M }
  type FormShape = { thresholds: Row[] }

  const wrappedValue = useMemo<FormShape>(
    () => ({ thresholds: value }),
    [value]
  )
  const handleChange = useCallback(
    (data: FormShape) => onChange(data.thresholds),
    [onChange]
  )

  const formMethods = useControlledForm<FormShape>({
    value: wrappedValue,
    onChange: handleChange,
    resolver: resolver as Resolver<FormShape> | undefined,
  })

  const { handleSubmit, control } = formMethods

  const { append, remove, fields } = useFieldArray({
    control,
    name: 'thresholds',
  })

  function handleAddThreshold(event: React.MouseEvent) {
    event.preventDefault()

    const firstMetric = metricsConfig.options[0]?.value
    if (firstMetric === undefined) return

    const firstStatistic =
      metricsConfig.getStatisticOptions(firstMetric)[0]?.value
    if (firstStatistic === undefined) return

    const newRow: Row = {
      id: crypto.randomUUID(),
      metric: firstMetric,
      statistic: firstStatistic,
      condition: '<',
      value: 0,
      stopTest: false,
      enabled: true,
    }
    append(newRow)
  }

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(handleChange)}>
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
              <Table.ColumnHeaderCell width="170px">
                Metric
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width="145px">
                Statistic
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width="90px">
                Condition
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width="125px">
                Value
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width="75px">
                Stop Test
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width="48px" />
              {!hideRemove && <Table.ColumnHeaderCell width="48px" />}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {fields.map((field, index) => (
              <ThresholdRow
                key={field.id}
                field={field}
                index={index}
                remove={hideRemove ? undefined : remove}
                metricsConfig={metricsConfig}
                getRowAnnotation={getRowAnnotation}
              />
            ))}
            <Table.Row>
              <Table.RowHeaderCell colSpan={columnCount} justify="center">
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
