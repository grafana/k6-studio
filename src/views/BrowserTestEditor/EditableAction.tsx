import { css } from '@emotion/react'
import { Flex, IconButton, Tooltip } from '@radix-ui/themes'
import { Trash2Icon } from 'lucide-react'
import type { ReactNode } from 'react'

import { AnyBrowserAction } from '@/schemas/browserTest'

import { OptionsSummary } from './Actions/components/OptionsSummary'
import { getActionEditorForAction } from './actionEditorRegistry'

interface EditableActionProps {
  dragHandle?: ReactNode
  action: AnyBrowserAction
  onChange: (action: AnyBrowserAction) => void
  onRemove: (actionId: AnyBrowserAction) => void
}

export function EditableAction({
  action,
  dragHandle,
  onRemove,
  onChange,
}: EditableActionProps) {
  const handleRemove = () => {
    onRemove(action)
  }

  const editor = getActionEditorForAction(action)

  return (
    <Flex
      direction="column"
      gap="1"
      p="2"
      css={css`
        font-size: var(--font-size-1);
      `}
    >
      <Flex align="center" gap="2">
        {dragHandle}
        {editor.icon}
        {editor.render({ action, onChange })}
        <Tooltip content="Remove action">
          <IconButton
            size="2"
            variant="ghost"
            color="gray"
            onClick={handleRemove}
            aria-label="Remove action"
            css={{ marginLeft: 'auto' }}
          >
            <Trash2Icon />
          </IconButton>
        </Tooltip>
      </Flex>
      {'options' in action && (
        <OptionsSummary
          options={action.options}
          excludeKeys={editor.summaryExcludeKeys}
        />
      )}
    </Flex>
  )
}
