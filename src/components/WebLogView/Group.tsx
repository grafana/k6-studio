import { css } from '@emotion/react'
import styled from '@emotion/styled'
import { ErrorMessage } from '@hookform/error-message'
import { Box, IconButton, TextField } from '@radix-ui/themes'
import { CheckIcon, CircleXIcon, PencilIcon, XIcon } from 'lucide-react'
import { KeyboardEvent, MouseEvent, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useClickAway } from 'react-use'

import { Group as GroupType } from '@/types'
import { mergeRefs } from '@/utils/react'

import { Collapsible } from '../Collapsible'
import { FieldError } from '../Form'

interface GroupProps {
  group: GroupType
  groups?: GroupType[]
  length: number
  children: React.ReactNode
  onUpdate?: (group: GroupType) => void
}

export function Group({
  group,
  groups = [],
  length,
  children,
  onUpdate,
}: GroupProps) {
  const headerRef = useRef<HTMLDivElement | null>(null)
  const canEdit = onUpdate !== undefined

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

  const setIsEditing = (value: boolean) => {
    onUpdate?.({
      ...group,
      isEditing: value,
    })
  }

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

  const handleEdit = (ev?: MouseEvent<HTMLElement>) => {
    ev?.preventDefault()

    if (canEdit) {
      setIsEditing(true)
    }
  }

  const handleReset = () => {
    setIsEditing(false)

    reset({
      name: group.name,
    })
  }

  const submit = ({ name }: { name: string }) => {
    onUpdate?.({
      ...group,
      name,
      isEditing: false,
    })
  }

  useClickAway(headerRef, () => {
    if (!group.isEditing) return

    return handleSubmit(submit)()
  })

  const isValidName = (value: string) => {
    if (value.trim() === '') {
      return false
    }

    if (groups.some((g) => g.id !== group.id && g.name === value)) {
      return 'A group with this name already exists.'
    }

    return true
  }

  const { ref: formRef, ...nameProps } = register('name', {
    validate: isValidName,
  })

  return (
    <Box>
      <Collapsible.Root defaultOpen>
        <Collapsible.Header ref={headerRef}>
          {group.isEditing && (
            <Collapsible.Heading>
              <InlineForm onSubmit={handleSubmit(submit)}>
                <TextField.Root
                  ref={mergeRefs(formRef, handleInputMount)}
                  size="1"
                  css={css`
                    flex: 1 1 0;
                  `}
                  onKeyDown={handleKeyDown}
                  {...nameProps}
                >
                  <TextField.Slot side="right">
                    <ErrorMessage errors={errors} name="name" as={FieldError} />
                  </TextField.Slot>
                  <TextField.Slot side="right">
                    {errors?.name !== undefined && (
                      <CircleXIcon color="var(--red-11)" />
                    )}
                  </TextField.Slot>
                </TextField.Root>
                <IconButton
                  type="submit"
                  disabled={!isValid}
                  variant="ghost"
                  color="green"
                  style={{ margin: 0 }}
                >
                  <CheckIcon />
                </IconButton>
                <IconButton
                  variant="ghost"
                  color="red"
                  style={{ margin: 0 }}
                  onClick={handleReset}
                >
                  <XIcon />
                </IconButton>
              </InlineForm>
            </Collapsible.Heading>
          )}
          {!group.isEditing && (
            <Collapsible.Heading>
              <Collapsible.Trigger>
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
              </Collapsible.Trigger>
              {canEdit && (
                <IconButton
                  variant="ghost"
                  color="gray"
                  style={{ margin: 0 }}
                  onClick={handleEdit}
                >
                  <PencilIcon />
                </IconButton>
              )}
            </Collapsible.Heading>
          )}
        </Collapsible.Header>
        <Collapsible.Content>
          <Box>{children}</Box>
        </Collapsible.Content>
      </Collapsible.Root>
    </Box>
  )
}

const InlineForm = styled.form`
  display: flex;
  flex: 1 1 0;
  width: 100%;
  gap: var(--space-1);
  align-items: center;
`
