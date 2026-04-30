import { Select } from '@radix-ui/themes'

import { LocatorClickButton } from '@/main/runner/schema'

const BUTTON_OPTIONS: { value: LocatorClickButton; label: string }[] = [
  { value: 'left', label: 'Left' },
  { value: 'middle', label: 'Middle' },
  { value: 'right', label: 'Right' },
]

interface ClickButtonFormProps {
  value: LocatorClickButton | undefined
  onChange: (button: LocatorClickButton) => void
}

export function ClickButtonForm({ value, onChange }: ClickButtonFormProps) {
  return (
    <Select.Root size="1" value={value ?? 'left'} onValueChange={onChange}>
      <Select.Trigger variant="soft" color="gray" aria-label="Mouse button" />
      <Select.Content>
        {BUTTON_OPTIONS.map((option) => (
          <Select.Item key={option.value} value={option.value}>
            {option.label}
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  )
}
