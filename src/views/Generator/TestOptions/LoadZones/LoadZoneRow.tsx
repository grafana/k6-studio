import { FieldGroup, ControlledSelect } from '@/components/Form'
import { Table } from '@/components/Table'
import { LoadZoneData } from '@/types/testOptions'
import {
  FieldArrayWithId,
  UseFieldArrayRemove,
  useFormContext,
} from 'react-hook-form'
import { IconButton, TextField } from '@radix-ui/themes'
import { TrashIcon } from '@radix-ui/react-icons'
import { LOAD_ZONES_REGIONS_OPTIONS } from './LoadZones.utils'

type LoadZoneRowProps = {
  index: number
  field: FieldArrayWithId<LoadZoneData, 'loadZones', 'id'>
  remove: UseFieldArrayRemove
}

export function LoadZoneRow({ field, index, remove }: LoadZoneRowProps) {
  const {
    register,
    formState: { errors },
    control,
  } = useFormContext<LoadZoneData>()

  return (
    <Table.Row key={field.id}>
      <Table.Cell>
        <FieldGroup errors={errors} name={`loadZones.${index}.loadZone`} mb="0">
          <ControlledSelect
            control={control}
            name={`loadZones.${index}.loadZone`}
            options={LOAD_ZONES_REGIONS_OPTIONS}
          />
        </FieldGroup>
      </Table.Cell>
      <Table.Cell>
        <FieldGroup errors={errors} name={`loadZones.${index}.percent`} mb="0">
          <TextField.Root
            type="number"
            placeholder="value"
            {...register(`loadZones.${index}.percent`, { valueAsNumber: true })}
          >
            <TextField.Slot side="right">%</TextField.Slot>
          </TextField.Root>
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
