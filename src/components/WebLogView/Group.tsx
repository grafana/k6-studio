import { css } from '@emotion/react'
import { Box, Flex, IconButton, TextField } from '@radix-ui/themes'
import {
  CheckIcon,
  Cross1Icon,
  CrossCircledIcon,
  Pencil1Icon,
} from '@radix-ui/react-icons'
import { useState, KeyboardEvent, useRef } from 'react'
import { Group as GroupType } from '@/types'
import { useForm } from 'react-hook-form'
import { FieldError } from '../Form'
import { mergeRefs } from '@/utils/react'
import { ErrorMessage } from '@hookform/error-message'
import { Collapsible } from '../Collapsible'
import { useOnClickOutside } from '@/utils/dom'

interface GroupProps {
  group: GroupType
  groups?: GroupType[]
  length: number
  children: React.ReactNode
  onRename?: (group: GroupType) => void
}

export function Group({
  group,
  groups = [],
  length,
  children,
  onRename,
}: GroupProps) {
  const headerRef = useRef<HTMLDivElement | null>(null)

  const [isEditing, setIsEditing] = useState(false)

  const {
    formState: { errors, isValid },
    reset,
    register,
    handleSubmit,
  } = useForm({
    defaultValues: {
      name: group.name,
    },
    mode: 'onChange',
  })

  const handleInputMount = (el: HTMLInputElement | null) => {
    if (document.activeElement !== el) {
      el?.focus()
      el?.select()
    }
  }

  const handleKeyDown = (ev: KeyboardEvent<HTMLInputElement>) => {
    if (ev.key === 'Escape') {
      handleReset()

      return
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleReset = () => {
    setIsEditing(false)

    reset({
      name: group.name,
    })
  }

  useOnClickOutside({
    ref: headerRef,
    handler: handleReset,
    enabled: isEditing,
  })

  const submit = ({ name }: { name: string }) => {
    onRename?.({
      ...group,
      name,
    })

    setIsEditing(false)
  }

  const isValidName = (value: string) => {
    if (value.trim() === '') {
      return false
    }

    if (groups.some((g) => g.id !== group.id && g.name === value)) {
      return 'A group with this name already exists.'
    }

    return true
  }

  const canEdit = onRename !== undefined

  const { ref: formRef, ...nameProps } = register('name', {
    validate: isValidName,
  })

  return (
    <Box>
      <Collapsible.Root defaultOpen>
        <Collapsible.Header ref={headerRef}>
          {isEditing && (
            <Collapsible.Heading>
              <form css={{ width: '100%' }} onSubmit={handleSubmit(submit)}>
                <TextField.Root
                  ref={mergeRefs(formRef, handleInputMount)}
                  size="1"
                  css={css`
                    width: 100%;
                  `}
                  onKeyDown={handleKeyDown}
                  {...nameProps}
                >
                  <TextField.Slot side="right">
                    <ErrorMessage errors={errors} name="name" as={FieldError} />
                  </TextField.Slot>
                  <TextField.Slot side="right">
                    {errors?.name !== undefined && (
                      <CrossCircledIcon color="red" />
                    )}
                  </TextField.Slot>
                </TextField.Root>
              </form>
            </Collapsible.Heading>
          )}
          {!isEditing && (
            <Collapsible.Trigger>
              <Collapsible.Heading>
                <span
                  css={css`
                    display: flex;
                    align-items: center;
                    min-height: 24px;
                    font-size: 13px;
                    font-weight: 500;
                  `}
                >
                  {group.name} ({length})
                </span>
              </Collapsible.Heading>
            </Collapsible.Trigger>
          )}
          {canEdit && (
            <EditActions
              isEditing={isEditing}
              isValid={isValid}
              onEdit={handleEdit}
              onCancel={handleReset}
              onSave={handleSubmit(submit)}
            />
          )}
        </Collapsible.Header>
        <Collapsible.Content>
          <Box>{children}</Box>
        </Collapsible.Content>
      </Collapsible.Root>
    </Box>
  )
}

interface EditActionsProps {
  isEditing: boolean
  isValid: boolean
  onEdit: () => void
  onCancel: () => void
  onSave: () => void
}

function EditActions({
  isEditing,
  isValid,
  onEdit,
  onCancel,
  onSave,
}: EditActionsProps) {
  return (
    <Flex pr="2" align="center" gap="1">
      {isEditing && (
        <IconButton
          disabled={!isValid}
          variant="ghost"
          color="green"
          style={{ margin: 0 }}
          onClick={onSave}
        >
          <CheckIcon />
        </IconButton>
      )}
      {isEditing && (
        <IconButton
          variant="ghost"
          color="red"
          style={{ margin: 0 }}
          onClick={onCancel}
        >
          <Cross1Icon />
        </IconButton>
      )}
      {!isEditing && (
        <IconButton
          variant="ghost"
          color="gray"
          style={{ margin: 0 }}
          onClick={onEdit}
        >
          <Pencil1Icon />
        </IconButton>
      )}
    </Flex>
  )
}
