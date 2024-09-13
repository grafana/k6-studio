import { ChangeEvent } from 'react'
import { TrashIcon } from '@radix-ui/react-icons'
import { IconButton, Table, TextField } from '@radix-ui/themes'

import { useGeneratorStore } from '@/store/generator'

interface StageProps {
  index: number
  target: string | number | undefined
  duration: string
}

export function Stage({ index, target, duration }: StageProps) {
  const { removeStage, updateStage } = useGeneratorStore()

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    const key = event.target.name

    if (!key || !['target', 'duration'].includes(key)) {
      console.error(
        'onChange requires [name=(target|duration)] to be set on the event target.'
      )

      return
    }

    if (key === 'duration' && !isStageDurationAllowedInput(value)) {
      return
    }

    updateStage(index, { target, duration, [key]: value })
  }

  const handleDelete = () => {
    removeStage(index)
  }

  return (
    <>
      <Table.Cell>
        <TextField.Root
          name="target"
          type="number"
          min={0}
          placeholder="Target"
          value={target}
          onChange={onChange}
        />
      </Table.Cell>
      <Table.Cell>
        <TextField.Root
          name="duration"
          placeholder="Duration"
          value={duration}
          onChange={onChange}
        />
      </Table.Cell>
      <Table.Cell>
        <IconButton onClick={handleDelete}>
          <TrashIcon width="18" height="18" />
        </IconButton>
      </Table.Cell>
    </>
  )
}

function isStageDurationAllowedInput(input: string) {
  return /^[hms\d]*$/.test(input)
}
