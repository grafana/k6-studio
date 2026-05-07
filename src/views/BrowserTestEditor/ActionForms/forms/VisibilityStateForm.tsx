import { Select } from '@radix-ui/themes'

const VISIBILITY_OPTIONS: { value: 'visible' | 'hidden'; label: string }[] = [
  { value: 'visible', label: 'visible' },
  { value: 'hidden', label: 'hidden' },
]

interface VisibilityStateFormProps {
  value: boolean
  onChange: (visible: boolean) => void
}

export function VisibilityStateForm({
  value,
  onChange,
}: VisibilityStateFormProps) {
  return (
    <Select.Root
      size="1"
      value={value ? 'visible' : 'hidden'}
      onValueChange={(next) => onChange(next === 'visible')}
    >
      <Select.Trigger
        variant="soft"
        color="gray"
        aria-label="Visibility state"
      />
      <Select.Content>
        {VISIBILITY_OPTIONS.map((option) => (
          <Select.Item key={option.value} value={option.value}>
            {option.label}
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  )
}
