import { css } from '@emotion/react'
import { Flex, IconButton } from '@radix-ui/themes'
import { CircleQuestionMarkIcon, GlobeIcon, Trash2Icon } from 'lucide-react'

import { BrowserActionWithId } from './types'

interface EditableActionProps {
  action: BrowserActionWithId
  onRemove: (actionId: string) => void
  onUpdate: (action: BrowserActionWithId) => void
}

export function EditableAction({ action, onRemove }: EditableActionProps) {
  const handleRemove = () => {
    onRemove(action.id)
  }

  return (
    <Flex
      align="center"
      p="2"
      gap="2"
      css={css`
        font-size: var(--font-size-1);

        & + & {
          border-top: 1px solid var(--studio-border-color);
        }
      `}
    >
      <ActionIcon action={action} /> <ActionDescription action={action} />
      <IconButton
        size="2"
        variant="ghost"
        color="gray"
        onClick={handleRemove}
        css={{ marginLeft: 'auto' }}
      >
        <Trash2Icon />
      </IconButton>
    </Flex>
  )
}

interface ActionIconProps {
  action: BrowserActionWithId
}

function ActionIcon({ action }: ActionIconProps) {
  switch (action.action.method) {
    case 'page.goto':
      return <GlobeIcon />
    default:
      return <CircleQuestionMarkIcon />
  }
}

interface ActionDescriptionProps {
  action: BrowserActionWithId
}

function ActionDescription({ action }: ActionDescriptionProps) {
  switch (action.action.method) {
    case 'page.goto':
      return <>Navigate to {action.action.url}</>
    default:
      return <>Unknown action: {action.action.method}</>
  }
}
