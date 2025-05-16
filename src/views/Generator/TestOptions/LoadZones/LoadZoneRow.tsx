import { IconButton, TextField } from '@radix-ui/themes'
import { Trash2Icon } from 'lucide-react'
import {
  FieldArrayWithId,
  UseFieldArrayRemove,
  useFormContext,
} from 'react-hook-form'

import { FieldGroup, ControlledSelect } from '@/components/Form'
import { Table } from '@/components/Table'
import { LoadZoneData } from '@/types/testOptions'

import { LOAD_ZONES_REGIONS_OPTIONS } from './LoadZones.utils'

type LoadZoneRowProps = {
  index: number
  field: FieldArrayWithId<LoadZoneData, 'zones', 'id'>
  remove: UseFieldArrayRemove
}

export function LoadZoneRow({ field, index, remove }: LoadZoneRowProps) {
  const {
    register,
    formState: { errors },
    control,
    watch,
  } = useFormContext<LoadZoneData>()

  const { distribution, zones } = watch()

  // Disable load zone options that are already in use
  const getLoadZoneOptions = () => {
    return LOAD_ZONES_REGIONS_OPTIONS.map((option) => ({
      ...option,
      disabled: zones.some(
        (zone, i) => zone.loadZone === option.value && i !== index
      ),
    }))
  }

  return (
    <Table.Row key={field.id}>
      <Table.Cell>
        <FieldGroup errors={errors} name={`zones.${index}.loadZone`} mb="0">
          <ControlledSelect
            control={control}
            name={`zones.${index}.loadZone`}
            options={getLoadZoneOptions()}
          />
        </FieldGroup>
      </Table.Cell>
      <Table.Cell>
        <FieldGroup errors={errors} name={`zones.${index}.percent`} mb="0">
          <TextField.Root
            type="number"
            min="1"
            max="100"
            placeholder="value"
            disabled={distribution === 'even'}
            {...register(`zones.${index}.percent`, { valueAsNumber: true })}
          >
            <TextField.Slot side="right">%</TextField.Slot>
          </TextField.Root>
        </FieldGroup>
      </Table.Cell>
      <Table.Cell>
        <IconButton onClick={() => remove(index)}>
          <Trash2Icon />
        </IconButton>
      </Table.Cell>
    </Table.Row>
  )
}
