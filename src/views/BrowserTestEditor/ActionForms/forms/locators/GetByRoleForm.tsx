import { Flex } from '@radix-ui/themes'

import { FieldGroup } from '@/components/Form'
import { ActionLocator } from '@/main/runner/schema'

import { ComboBox, TextFieldWithExactToggle } from '../../components'
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
            onChange({ ...locator, role: value.trim() })
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
        <TextFieldWithExactToggle
          name="name"
          value={locator.options?.name || ''}
          exact={locator.options?.exact}
          exactDisabled={!locator.options?.name}
          onValueChange={(value) => {
            onChange({
              ...locator,
              options: {
                ...locator.options,
                name: value.trim() ? value : undefined,
              },
            })
          }}
          onExactChange={(exact) => {
            onChange({
              ...locator,
              options: {
                ...locator.options,
                exact,
              },
            })
          }}
          onBlur={onBlur}
        />
      </FieldGroup>
    </Flex>
  )
}
