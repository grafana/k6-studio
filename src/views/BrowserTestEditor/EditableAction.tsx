import { css } from '@emotion/react'
import { Flex, IconButton, Tooltip } from '@radix-ui/themes'
import { Trash2Icon } from 'lucide-react'
import type { ReactNode } from 'react'

import { BrowserDebuggerEvent } from '@/main/runner/schema'
import { AnyBrowserAction } from '@/schemas/browserTest'

import { OptionsSummary } from './Actions/components/OptionsSummary'
import { getActionEditorForAction } from './actionEditorRegistry'

interface EditableActionProps {
  state: BrowserDebuggerEvent | undefined
  action: AnyBrowserAction
  onRemove: (actionId: string) => void
  onChange: (action: AnyBrowserAction) => void
  dragHandle?: ReactNode
}

export function EditableAction({
  state,
  action,
  dragHandle,
  onRemove,
  onChange,
}: EditableActionProps) {
  const handleRemove = () => {
    onRemove(action.id)
  }

  const editor = getActionEditorForAction(action)

  return (
    <Flex
      direction="column"
      gap="1"
      p="2"
      data-result={state?.result?.type}
      css={css`
        font-size: var(--font-size-1);
        border-left: 4px solid transparent;

        &[data-result='pass'] {
          border-color: var(--green-11);
        }

        &[data-result='fail'],
        &[data-result='error'] {
          border-color: var(--red-11);
        }
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
