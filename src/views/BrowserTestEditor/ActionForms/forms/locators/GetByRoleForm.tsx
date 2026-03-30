import { Flex, TextField } from '@radix-ui/themes'

import { FieldGroup } from '@/components/Form'
import { ActionLocator } from '@/main/runner/schema'

import { ComboBox } from '../../components'
import { toFieldErrors } from '../utils'

const ROLE_OPTIONS = [
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

type RoleLocator = Extract<ActionLocator, { type: 'role' }>

interface GetByRoleFormProps {
  locator: RoleLocator
  errors?: Record<string, string>
  onChange: (locator: ActionLocator) => void
  onBlur?: () => void
}

export function GetByRoleForm({
  locator,
  errors,
  onChange,
  onBlur,
}: GetByRoleFormProps) {
  return (
    <Flex direction="column" gap="2" align="stretch">
      <FieldGroup
        name="role"
        label="Element role"
        labelSize="1"
        mb="0"
        errors={toFieldErrors('role', errors?.['role'])}
      >
        <ComboBox
          id="role"
          value={locator.role}
          options={ROLE_OPTIONS}
          onChange={(value) => {
            onChange({ ...locator, role: value })
            onBlur?.()
          }}
        />
      </FieldGroup>
      <FieldGroup
        name="name"
        label="Name (optional)"
        labelSize="1"
        mb="0"
        errors={toFieldErrors('name', errors?.['name'])}
      >
        <TextField.Root
          size="1"
          name="name"
          value={locator.options?.name || ''}
          onChange={(e) => {
            const value = e.target.value
            onChange({
              ...locator,
              options: value.trim()
                ? { ...locator.options, name: value }
                : locator.options,
            })
          }}
          onBlur={onBlur}
        />
      </FieldGroup>
    </Flex>
  )
}
