import { Flex } from '@radix-ui/themes'

import { FieldGroup } from '@/components/Form'
import { ElementLocator, RoleLocator } from '@/schemas/locator'

import { ComboBox, TextFieldWithExactToggle } from '../../components'
import { toFieldErrors } from '../utils'

import { FieldErrors } from './validation'

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

interface GetByRoleFormProps {
  locator: RoleLocator | undefined
  isTouched: boolean
  errors: FieldErrors['role'] | undefined
  suggestedRoles?: string[]
  onChange: (locator: ElementLocator) => void
  onBlur?: () => void
}

export function GetByRoleForm({
  isTouched,
  errors,
  suggestedRoles = DEFAULT_ROLES,
  locator = {
    type: 'role',
    role: suggestedRoles[0] ?? '',
    options: { exact: false },
  },
  onBlur,
  onChange,
}: GetByRoleFormProps) {
  return (
    <Flex direction="column" gap="2" align="stretch">
      <FieldGroup
        name="role"
        label="Element role"
        labelSize="1"
        mb="0"
        errors={toFieldErrors('role', isTouched && errors?.role)}
      >
        <ComboBox
          id="role"
          value={locator.role}
          options={toRoleOptions(suggestedRoles)}
          onChange={(value) => {
            onChange({
              ...locator,
              role: value.trim(),
            })

            onBlur?.()
          }}
        />
      </FieldGroup>
      <FieldGroup name="name" label="Name (optional)" labelSize="1" mb="0">
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
