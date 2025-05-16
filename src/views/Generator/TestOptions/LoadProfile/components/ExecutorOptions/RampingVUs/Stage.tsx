import { IconButton, Table, TextField } from '@radix-ui/themes'
import { Trash2Icon } from 'lucide-react'
import { FieldErrors, UseFormRegister } from 'react-hook-form'

import { FieldGroup } from '@/components/Form'
import { LoadProfileExecutorOptions } from '@/types/testOptions'
import { stringAsOptionalNumber } from '@/utils/form'

interface StageProps {
  index: number
  register: UseFormRegister<LoadProfileExecutorOptions>
  errors: FieldErrors<LoadProfileExecutorOptions>
  handleRemove: () => void
}

export function Stage({ index, register, handleRemove, errors }: StageProps) {
  return (
    <>
      <Table.Cell>
        <FieldGroup errors={errors} name={`stages.${index}.target`} mb="0">
          <TextField.Root
            type="number"
            min={0}
            onKeyDown={(e) => {
              if (['-', '+', 'e'].includes(e.key)) {
                e.preventDefault()
              }
            }}
            placeholder="Target"
            {...register(`stages.${index}.target`, {
              setValueAs: stringAsOptionalNumber,
            })}
          />
        </FieldGroup>
      </Table.Cell>
      <Table.Cell>
        <FieldGroup errors={errors} name={`stages.${index}.duration`} mb="0">
          <TextField.Root
            placeholder="Duration"
            {...register(`stages.${index}.duration`)}
          />
        </FieldGroup>
      </Table.Cell>
      <Table.Cell>
        <IconButton onClick={handleRemove}>
          <Trash2Icon />
        </IconButton>
      </Table.Cell>
    </>
  )
}
