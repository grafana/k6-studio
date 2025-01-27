import { FieldGroup, ControlledSelect } from '@/components/Form'
import { Threshold, ThresholdData } from '@/types/thresholds'
import { TrashIcon } from '@radix-ui/react-icons'
import { Table, TextField, Checkbox, IconButton } from '@radix-ui/themes'
import {
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

export function ThresholdRow({
  field,
  index,
  remove,
}: {
  index: number
  field: FieldArrayWithId<{ thresholds: Threshold[] }, 'thresholds', 'id'>
  remove: UseFieldArrayRemove
}) {
  const {
    register,
    formState: { errors },
    control,
    watch,
  } = useFormContext<ThresholdData>()

  const threshold = watch('thresholds')[index]

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
            options={[]}
            control={control}
            name={`thresholds.${index}.url`}
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
        <FieldGroup
          mb="0"
          errors={errors}
          name={`thresholds.${index}.stopTest`}
        >
          <Checkbox {...register(`thresholds.${index}.stopTest`)} />
        </FieldGroup>
      </Table.Cell>
      <Table.Cell>
        <IconButton onClick={() => remove(index)}>
          <TrashIcon width="18" height="18" />
        </IconButton>
      </Table.Cell>
    </Table.Row>
  )
}
