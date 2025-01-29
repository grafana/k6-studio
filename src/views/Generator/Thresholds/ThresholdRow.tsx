import { FieldGroup, ControlledSelect } from '@/components/Form'
import { ThresholdData } from '@/types/thresholds'
import { TrashIcon } from '@radix-ui/react-icons'
import { Table, TextField, Checkbox, IconButton, Flex } from '@radix-ui/themes'
import {
  Controller,
  FieldArrayWithId,
  UseFieldArrayRemove,
  useFormContext,
} from 'react-hook-form'
import {
  THRESHOLD_METRICS_OPTIONS,
  getStatisticOptions,
  THRESHOLD_CONDITIONS_OPTIONS,
  getMetricUnit,
} from './Thresholds.utils'
import { useThresholdURLOptions } from './Thresholds.hooks'
import { css } from '@emotion/react'
import { useTheme } from '@/hooks/useTheme'

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
  } = useFormContext<ThresholdData>()

  const urlOptions = useThresholdURLOptions()
  const threshold = watch('thresholds')[index]
  const theme = useTheme()

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
        <FieldGroup errors={errors} name={`thresholds.${index}.url`} mb="0">
          <ControlledSelect
            options={urlOptions}
            control={control}
            name={`thresholds.${index}.url`}
            contentProps={{
              css: css`
                .rt-SelectItem:where([data-disabled]) {
                  background-color: ${theme === 'dark'
                    ? 'var(--gray-6)'
                    : 'var(--gray-3)'};
                  color: var(--sand-12);
                  font-size: var(--font-size-1);
                  padding: 0 var(--space-2);
                }
              `,
            }}
          />
        </FieldGroup>
      </Table.Cell>
      <Table.Cell>
        <FieldGroup
          mb="0"
          errors={errors}
          name={`thresholds.${index}.statisic`}
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
          />
        </FieldGroup>
      </Table.Cell>
      <Table.Cell>
        <FieldGroup errors={errors} name={`thresholds.${index}.value`} mb="0">
          <TextField.Root
            type="number"
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
                onCheckedChange={field.onChange}
                {...register(`thresholds.${index}.stopTest`)}
              />
            )}
          />
        </Flex>
      </Table.Cell>
      <Table.Cell>
        <IconButton onClick={() => remove(index)}>
          <TrashIcon width="18" height="18" />
        </IconButton>
      </Table.Cell>
    </Table.Row>
  )
}
