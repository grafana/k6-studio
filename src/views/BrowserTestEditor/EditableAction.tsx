import { css } from '@emotion/react'
import { Flex } from '@radix-ui/themes'
import { CircleQuestionMarkIcon, GlobeIcon } from 'lucide-react'

import { AnyBrowserAction } from '@/main/runner/schema'

interface EditableActionProps {
  action: AnyBrowserAction
}

export function EditableAction({ action }: EditableActionProps) {
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
    </Flex>
  )
}

interface ActionIconProps {
  action: AnyBrowserAction
}

function ActionIcon({ action }: ActionIconProps) {
  switch (action.method) {
    case 'page.goto':
      return <GlobeIcon />
    default:
      return <CircleQuestionMarkIcon />
  }
}

interface ActionDescriptionProps {
  action: AnyBrowserAction
}

function ActionDescription({ action }: ActionDescriptionProps) {
  switch (action.method) {
    case 'page.goto':
      return <>Navigate to {action.url}</>
    default:
      return <>Unknown action: {action.method}</>
  }
}
