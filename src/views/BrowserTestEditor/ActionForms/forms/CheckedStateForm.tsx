import { Select } from '@radix-ui/themes'

const CHECKED_OPTIONS: { value: 'checked' | 'unchecked'; label: string }[] = [
  { value: 'checked', label: 'checked' },
  { value: 'unchecked', label: 'unchecked' },
]

interface CheckedStateFormProps {
  value: boolean
  onChange: (checked: boolean) => void
}

export function CheckedStateForm({ value, onChange }: CheckedStateFormProps) {
  return (
    <Select.Root
      size="1"
      value={value ? 'checked' : 'unchecked'}
      onValueChange={(next) => onChange(next === 'checked')}
    >
      <Select.Trigger variant="soft" color="gray" aria-label="Checked state" />
      <Select.Content>
        {CHECKED_OPTIONS.map((option) => (
          <Select.Item key={option.value} value={option.value}>
            {option.label}
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  )
}
