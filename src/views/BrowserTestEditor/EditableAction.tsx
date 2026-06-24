import { css, keyframes } from '@emotion/react'
import { Flex, IconButton, Tooltip } from '@radix-ui/themes'
import { Trash2Icon } from 'lucide-react'
import { useMemo, type ReactNode } from 'react'

import { BrowserDebuggerEvent } from '@/main/runner/schema'
import { AnyBrowserAction } from '@/schemas/browserTest'
import { ActionStatus, getStatusColor } from '@/utils/browserActionStatus'

import { getActionEditorForAction } from './actionEditorRegistry'
import { OptionsSummary } from './Actions/components/OptionsSummary'
import { FrameChain, FrameChainProvider } from './FrameChainContext'
import { useBrowserActionState } from './ValidationProvider'

interface EditableActionProps {
  dragHandle?: ReactNode
  action: AnyBrowserAction
  onChange: (action: AnyBrowserAction) => void
  onRemove: (actionId: AnyBrowserAction) => void
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
    onRemove(action)
  }

  const editor = getActionEditorForAction(action)

  const status = getActionStatus(isValidating, state)
  const color = status ? getStatusColor(status, 9) : 'transparent'
  const opacity = status === 'pending' ? 0.7 : 1

  // Locator actions get an editable iframe chain rendered inline by their
  // locator form; other actions get an inert chain. Memoize so the context
  // value stays stable and consumers don't re-render on every parent render.
  const frameChain: FrameChain = useMemo(
    () =>
      'locator' in action
        ? {
            frames: action.frames,
            onChange: (frames) => onChange({ ...action, frames }),
          }
        : { frames: undefined },
    [action, onChange]
  )

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
        <FrameChainProvider value={frameChain}>
          {editor.render({ action, onChange })}
        </FrameChainProvider>
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
