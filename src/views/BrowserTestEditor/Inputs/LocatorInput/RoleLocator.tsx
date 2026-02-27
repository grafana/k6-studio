import { Flex, TextField } from '@radix-ui/themes'

import { FieldGroup } from '@/components/Form'
import { ActionLocator } from '@/main/runner/schema'

import { SuggestionInput } from './SuggestionInput'

type RoleLocator = Extract<ActionLocator, { type: 'role' }>

interface RoleLocatorProps {
  locator: RoleLocator
  onChange: (locator: RoleLocator) => void
}

const ROLE_SUGGESTIONS = [
  'button',
  'link',
  'checkbox',
  'radio',
  'switch',
  'textbox',
  'searchbox',
  'combobox',
  'listbox',
  'option',
].map((role) => ({ value: role, label: role }))

export function RoleLocator({ locator, onChange }: RoleLocatorProps) {
  return (
    <Flex direction="column" gap="2" align="stretch">
      <FieldGroup name="role" label="Element role" labelSize="1" mb="0">
        <SuggestionInput
          id="role"
          value={locator.role}
          options={ROLE_SUGGESTIONS}
          onChange={(value) => onChange({ ...locator, role: value })}
        />
      </FieldGroup>
      <FieldGroup name="name" label="Name (optional)" labelSize="1" mb="0">
        <TextField.Root
          size="1"
          id="name"
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
