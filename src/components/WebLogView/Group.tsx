import { css } from '@emotion/react'
import { Box, Flex, IconButton, TextField } from '@radix-ui/themes'
import { CollapsibleSection } from '../CollapsibleSection'
import { CheckIcon, Cross1Icon, Pencil1Icon } from '@radix-ui/react-icons'
import { useState, KeyboardEvent, ChangeEvent } from 'react'
import { useGeneratorStore } from '@/store/generator'

interface GroupProps {
  name: string
  length: number
  children: React.ReactNode
  onRename?: (oldName: string, newName: string) => void
}

export function Group({ name, length, children, onRename }: GroupProps) {
  const requests = useGeneratorStore((state) => state.requests)

  const [error, setError] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<string | null>(null)

  const handleInputMount = (el: HTMLInputElement | null) => {
    if (document.activeElement !== el) {
      el?.focus()
      el?.select()
    }
  }

  const handleKeyDown = (ev: KeyboardEvent<HTMLInputElement>) => {
    if (ev.key === 'Escape') {
      setError(null)
      setEditValue(null)

      return
    }

    if (ev.key === 'Enter') {
      handleSave()

      return
    }
  }

  const handleNameChange = (ev: ChangeEvent<HTMLInputElement>) => {
    const value = ev.target.value

    if (value !== name && requests.some((request) => request.group === value)) {
      setError('A group with this name already exists.')
    }

    setEditValue(ev.target.value)
  }

  const handleEdit = () => {
    setEditValue(name)
  }

  const reset = () => {
    setError(null)
    setEditValue(null)
  }

  const handleSave = () => {
    if (onRename === undefined || editValue === null || error !== null) {
      return
    }

    onRename(name, editValue)

    reset()
  }

  const canEdit = onRename !== undefined
  const isEditing = canEdit && editValue !== null

  return (
    <Box>
      <CollapsibleSection
        defaultOpen
        noTrigger={isEditing}
        content={<Box>{children}</Box>}
        actions={
          canEdit && (
            <EditActions
              isEditing={isEditing}
              hasError={error !== null}
              onEdit={handleEdit}
              onCancel={reset}
              onSave={handleSave}
            />
          )
        }
      >
        {isEditing && (
          <TextField.Root
            ref={handleInputMount}
            size="1"
            value={editValue}
            color={error !== null ? 'red' : undefined}
            css={css`
              width: 100%;
            `}
            onKeyDown={handleKeyDown}
            onChange={handleNameChange}
          />
        )}
        {!isEditing && (
          <span
            css={css`
              display: flex;
              align-items: center;
              min-height: 24px;
              font-size: 13px;
              font-weight: 500;
            `}
          >
            {name} ({length})
          </span>
        )}
      </CollapsibleSection>
    </Box>
  )
}

interface EditActionsProps {
  isEditing: boolean
  hasError: boolean
  onEdit: () => void
  onCancel: () => void
  onSave: () => void
}

function EditActions({
  isEditing,
  hasError,
  onEdit,
  onCancel,
  onSave,
}: EditActionsProps) {
  return (
    <Flex align="center" gap="1">
      {isEditing && (
        <IconButton
          disabled={hasError}
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
