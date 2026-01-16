import { css } from '@emotion/react'
import { Flex, Heading } from '@radix-ui/themes'

import { EmptyMessage } from '@/components/EmptyMessage'
import { AnyBrowserAction } from '@/main/runner/schema'

import { NewActionMenu } from './NewActionMenu'

interface EditableBrowserActionListProps {
  actions: AnyBrowserAction[]
  onAddAction: (action: AnyBrowserAction) => void
}

export function EditableBrowserActionList({
  actions,
  onAddAction,
}: EditableBrowserActionListProps) {
  return (
    <Flex direction="column" height="100%">
      <Heading
        size="2"
        weight="medium"
        css={css`
          min-height: 40px;
          padding: 0 var(--space-4) 0 var(--space-2);
          border-bottom: 1px solid var(--gray-a5);
          display: flex;
          align-items: center;
        `}
      >
        Browser actions ({actions.length})
      </Heading>
      {actions.map((action, index) => (
        <pre key={index}>{JSON.stringify(action, null, 2)}</pre>
      ))}
      {actions.length === 0 ? (
        <EmptyMessage
          message="Build your browser test by adding actions."
          action={<NewActionMenu onAddAction={onAddAction} />}
        />
      ) : (
        <NewActionMenu onAddAction={onAddAction} />
      )}
    </Flex>
  )
}
