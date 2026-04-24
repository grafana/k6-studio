import { Flex } from '@radix-ui/themes'

import { FieldGroup } from '@/components/Form'
import { ActionLocator } from '@/schemas/locator'

import { ComboBox, TextFieldWithExactToggle } from '../../components'
import { toFieldErrors } from '../utils'

const DEFAULT_ROLES = [
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
]

function toRoleOptions(roles: string[]) {
  return roles.map((role) => ({ value: role, label: role }))
}

type RoleLocator = Extract<ActionLocator, { type: 'role' }>

interface GetByRoleFormProps {
  locator: RoleLocator
  errors?: Record<string, string>
  onChange: (locator: ActionLocator) => void
  onBlur?: () => void
  suggestedRoles?: string[]
}

export function GetByRoleForm({
  locator,
  errors,
  onChange,
  onBlur,
  suggestedRoles,
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
          options={toRoleOptions(suggestedRoles ?? DEFAULT_ROLES)}
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
