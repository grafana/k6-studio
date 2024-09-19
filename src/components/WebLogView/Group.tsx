import { css } from '@emotion/react'
import { Box, IconButton, TextField } from '@radix-ui/themes'
import {
  CheckIcon,
  Cross1Icon,
  CrossCircledIcon,
  Pencil1Icon,
} from '@radix-ui/react-icons'
import { useState, KeyboardEvent, MouseEvent, useRef } from 'react'
import { Group as GroupType } from '@/types'
import { useForm } from 'react-hook-form'
import { FieldError } from '../Form'
import { mergeRefs } from '@/utils/react'
import { ErrorMessage } from '@hookform/error-message'
import { Collapsible } from '../Collapsible'
import { useOnClickOutside } from '@/utils/dom'
import styled from '@emotion/styled'
import { useEffectOnce } from 'react-use'

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
  const canEdit = onRename !== undefined

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

  useEffectOnce(() => {
    if (canEdit && group.name !== 'Default') {
      setIsEditing(true)
    }
  })

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
    onRename?.({
      ...group,
      name,
    })

    setIsEditing(false)
  }

  useOnClickOutside({
    ref: headerRef,
    handler: handleSubmit(submit),
    enabled: isEditing,
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
          {isEditing && (
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
                      <CrossCircledIcon color="red" />
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
                  <Cross1Icon />
                </IconButton>
              </InlineForm>
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
                {canEdit && (
                  <IconButton
                    variant="ghost"
                    color="gray"
                    style={{ margin: 0 }}
                    onClick={handleEdit}
                  >
                    <Pencil1Icon />
                  </IconButton>
                )}
              </Collapsible.Heading>
            </Collapsible.Trigger>
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
