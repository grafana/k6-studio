import { Flex, TextField, Select } from '@radix-ui/themes'

import { FieldGroup } from '@/components/Form'
import { ActionLocator } from '@/main/runner/schema'

type RoleLocator = Extract<ActionLocator, { type: 'role' }>

interface RoleLocatorProps {
  locator: RoleLocator
  onChange: (locator: RoleLocator) => void
}

const ROLE_OPTIONS = [
  { value: 'button', label: 'Button' },
  { value: 'link', label: 'Link' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'textbox', label: 'Textbox' },
  { value: 'combobox', label: 'Combobox' },
  { value: 'listbox', label: 'Listbox' },
  { value: 'menuitem', label: 'Menu item' },
  { value: 'option', label: 'Option' },
  { value: 'radio', label: 'Radio button' },
  { value: 'switch', label: 'Switch' },
  // Add more roles as needed
]

export function RoleLocator({ locator, onChange }: RoleLocatorProps) {
  return (
    <Flex direction="column" gap="2" align="stretch">
      <FieldGroup name="role" label="Element role" labelSize="1" mb="0">
        <Select.Root
          value={locator.role}
          name="role"
          size="1"
          onValueChange={(value) => onChange({ ...locator, role: value })}
        >
          <Select.Trigger />
          <Select.Content>
            {ROLE_OPTIONS.map((option) => (
              <Select.Item key={option.value} value={option.value}>
                {option.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </FieldGroup>
      <FieldGroup name="name" label="Name (optional)" labelSize="1" mb="0">
        <TextField.Root
          size="1"
          name="name"
          value={locator.options?.name || ''}
          onChange={(e) =>
            onChange({
              ...locator,
              options: { ...locator.options, name: e.target.value },
            })
          }
        />
      </FieldGroup>
    </Flex>
  )
}
