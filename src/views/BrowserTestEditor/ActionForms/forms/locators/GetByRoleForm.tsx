import { css } from '@emotion/react'
import { Flex, IconButton, TextField, Tooltip } from '@radix-ui/themes'
import { WholeWordIcon } from 'lucide-react'

import { FieldGroup } from '@/components/Form'
import { ActionLocator } from '@/main/runner/schema'

import { ComboBox } from '../../components'
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
        <TextField.Root
          size="1"
          name="name"
          value={locator.options?.name || ''}
          onChange={(e) => {
            const value = e.target.value
            onChange({
              ...locator,
              options: {
                ...locator.options,
                name: value.trim() ? value : undefined,
              },
            })
          }}
          onBlur={onBlur}
        >
          <TextField.Slot side="right">
            <Tooltip content="Exact match">
              <IconButton
                size="1"
                disabled={!locator.options?.name}
                aria-label="Toggle exact match"
                aria-pressed={locator.options?.exact ? 'true' : 'false'}
                variant="ghost"
                color={locator.options?.exact ? 'orange' : 'gray'}
                onClick={() => {
                  onChange({
                    ...locator,
                    options: {
                      ...locator.options,
                      exact: !locator.options?.exact,
                    },
                  })
                  onBlur?.()
                }}
                css={css`
                  margin: 0;
                `}
              >
                <WholeWordIcon />
              </IconButton>
            </Tooltip>
          </TextField.Slot>
        </TextField.Root>
      </FieldGroup>
    </Flex>
  )
}
