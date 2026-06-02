import { css, keyframes } from '@emotion/react'
import { Flex, IconButton, Tooltip } from '@radix-ui/themes'
import { Trash2Icon } from 'lucide-react'
import type { ReactNode } from 'react'

import { BrowserDebuggerEvent } from '@/main/runner/schema'
import { AnyBrowserAction } from '@/schemas/browserTest'
import { ActionStatus, getStatusColor } from '@/utils/browserActionStatus'

import { OptionsSummary } from './Actions/components/OptionsSummary'
import { useBrowserActionState } from './ValidationProvider'
import { getActionEditorForAction } from './actionEditorRegistry'

interface EditableActionProps {
  action: AnyBrowserAction
  onRemove: (actionId: string) => void
  onChange: (action: AnyBrowserAction) => void
  dragHandle?: ReactNode
}

const runningPulse = keyframes`
  from { transform: translateY(-100%); }
  to { transform: translateY(100%); }
`

function getActionStatus(
  isValidating: boolean,
  event: BrowserDebuggerEvent | undefined
): ActionStatus | undefined {
  if (event?.state === 'end') {
    return event.result.type
  }

  if (!isValidating) {
    return undefined
  }

  if (event?.state === 'begin') {
    return 'running'
  }

  return 'pending'
}

export function EditableAction({
  action,
  dragHandle,
  onRemove,
  onChange,
}: EditableActionProps) {
  const { isValidating, state } = useBrowserActionState(action.id)

  const handleRemove = () => {
    onRemove(action.id)
  }

  const editor = getActionEditorForAction(action)

  const status = getActionStatus(isValidating, state)
  const color = status ? getStatusColor(status, 9) : 'transparent'
  const opacity = status === 'pending' ? 0.7 : 1

  return (
    <Flex
      direction="column"
      gap="1"
      p="2"
      pl="3"
      css={css`
        font-size: var(--font-size-1);
        position: relative;
        overflow: hidden;
        opacity: ${opacity};

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          width: 4px;
          height: 100%;

          background: ${color};

          ${
            status === 'running' &&
            css`
              animation: ${runningPulse} 2s linear infinite;
            `
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
