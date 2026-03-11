import { css } from '@emotion/react'
import { Flex, IconButton, Tooltip } from '@radix-ui/themes'
import { Trash2Icon } from 'lucide-react'

import { OptionsSummary } from './Actions/components/OptionsSummary'
import { getActionEditorForAction } from './actionEditorRegistry'
import { BrowserActionInstance } from './types'

interface EditableActionProps {
  action: BrowserActionInstance
  onRemove: (actionId: string) => void
  onUpdate: (action: BrowserActionInstance) => void
}

export function EditableAction({
  action,
  onRemove,
  onUpdate,
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
      css={css`
        font-size: var(--font-size-1);

        & + & {
          border-top: 1px solid var(--studio-border-color);
        }
      `}
    >
      <Flex align="center" gap="2">
        {editor.icon}
        {editor.render({ action, onUpdate })}
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
      {'options' in action && <OptionsSummary options={action.options} />}
    </Flex>
  )
}
