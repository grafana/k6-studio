import { TrashIcon } from '@radix-ui/react-icons'
import { IconButton, Table, TextField } from '@radix-ui/themes'

import { FieldErrors, UseFormRegister } from 'react-hook-form'
import { LoadProfileExecutorOptions } from '@/types/testOptions'
import { stringAsOptionalNumber } from '@/utils/form'
import { FieldGroup } from '@/components/Form'

interface StageProps {
  index: number
  register: UseFormRegister<LoadProfileExecutorOptions>
  errors: FieldErrors<LoadProfileExecutorOptions>
  handleRemove: () => void
}

export function Stage({ index, register, handleRemove, errors }: StageProps) {
  return (
    <>
      <Table.Cell width="45%">
        <FieldGroup errors={errors} name={`stages.${index}.target`} mb="0">
          <TextField.Root
            type="number"
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
      <Table.Cell width="45%">
        <FieldGroup errors={errors} name={`stages.${index}.duration`} mb="0">
          <TextField.Root
            placeholder="Duration"
            {...register(`stages.${index}.duration`)}
          />
        </FieldGroup>
      </Table.Cell>
      <Table.Cell>
        <IconButton onClick={handleRemove}>
          <TrashIcon width="18" height="18" />
        </IconButton>
      </Table.Cell>
    </>
  )
}
