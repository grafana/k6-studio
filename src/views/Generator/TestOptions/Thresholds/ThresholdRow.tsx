import { Table, TextField, Checkbox, IconButton, Flex } from '@radix-ui/themes'
import { Trash2Icon } from 'lucide-react'
import { useEffect } from 'react'
import {
  Controller,
  FieldArrayWithId,
  UseFieldArrayRemove,
  useFormContext,
} from 'react-hook-form'

import { FieldGroup, ControlledSelect } from '@/components/Form'
import { ThresholdData, Threshold } from '@/types/testOptions'

import {
  THRESHOLD_METRICS_OPTIONS,
  getStatisticOptions,
  THRESHOLD_CONDITIONS_OPTIONS,
  getMetricUnit,
} from './Thresholds.utils'

type ThresholdRowProps = {
  index: number
  field: FieldArrayWithId<ThresholdData, 'thresholds', 'id'>
  remove: UseFieldArrayRemove
}

export function ThresholdRow({ field, index, remove }: ThresholdRowProps) {
  const {
    register,
    formState: { errors },
    control,
    watch,
    setValue,
  } = useFormContext<ThresholdData>()

  const threshold = watch('thresholds')[index] as Threshold

  // Handle selected statistic when the metric field changes
  useEffect(() => {
    const availableStatistics = getStatisticOptions(threshold.metric).map(
      (option) => option.value
    )
    if (!availableStatistics.includes(threshold.statistic)) {
      const newStatistic = availableStatistics[0]
      if (newStatistic) {
        setValue(`thresholds.${index}.statistic`, newStatistic)
      }
    }
  }, [threshold.metric, threshold.statistic, index, setValue])

  return (
    <Table.Row key={field.id}>
      <Table.Cell>
        <FieldGroup errors={errors} name={`thresholds.${index}.metric`} mb="0">
          <ControlledSelect
            control={control}
            name={`thresholds.${index}.metric`}
            options={THRESHOLD_METRICS_OPTIONS}
          />
        </FieldGroup>
      </Table.Cell>
      <Table.Cell>
        <FieldGroup
          mb="0"
          errors={errors}
          name={`thresholds.${index}.statistic`}
        >
          <ControlledSelect
            control={control}
            name={`thresholds.${index}.statistic`}
            options={
              threshold?.metric ? getStatisticOptions(threshold.metric) : []
            }
          />
        </FieldGroup>
      </Table.Cell>
      <Table.Cell>
        <FieldGroup
          mb="0"
          errors={errors}
          name={`thresholds.${index}.condition`}
        >
          <ControlledSelect
            control={control}
            name={`thresholds.${index}.condition`}
            options={THRESHOLD_CONDITIONS_OPTIONS}
            triggerValue={(val) => (
              <Flex>
                {
                  THRESHOLD_CONDITIONS_OPTIONS.find(
                    (option) => option.value === val
                  )?.icon
                }
              </Flex>
            )}
          />
        </FieldGroup>
      </Table.Cell>
      <Table.Cell>
        <FieldGroup errors={errors} name={`thresholds.${index}.value`} mb="0">
          <TextField.Root
            type="number"
            step="0.01"
            placeholder="value"
            {...register(`thresholds.${index}.value`, { valueAsNumber: true })}
          >
            <TextField.Slot side="right">
              {threshold?.metric ? getMetricUnit(threshold.metric) : ''}
            </TextField.Slot>
          </TextField.Root>
        </FieldGroup>
      </Table.Cell>
      <Table.Cell align="center" justify="center">
        <Flex align="center" justify="center" height="100%">
          <Controller
            control={control}
            name={`thresholds.${index}.stopTest`}
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                {...register(`thresholds.${index}.stopTest`)}
              />
            )}
          />
        </Flex>
      </Table.Cell>
      <Table.Cell>
        <IconButton onClick={() => remove(index)}>
          <Trash2Icon />
        </IconButton>
      </Table.Cell>
    </Table.Row>
  )
}
