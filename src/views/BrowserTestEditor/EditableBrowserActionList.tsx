import { css } from '@emotion/react'
import { Flex, Heading, ScrollArea } from '@radix-ui/themes'

import { EmptyMessage } from '@/components/EmptyMessage'

import { EditableAction } from './EditableAction'
import { NewActionMenu } from './NewActionMenu'
import { BrowserActionWithId } from './types'

interface EditableBrowserActionListProps {
  actions: BrowserActionWithId[]
  onAddAction: (action: BrowserActionWithId) => void
  onRemoveAction: (actionId: string) => void
  onUpdateAction: (action: BrowserActionWithId) => void
}

export function EditableBrowserActionList({
  actions,
  onAddAction,
  onRemoveAction,
  onUpdateAction,
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
          gap: var(--space-3);
          box-sizing: border-box;
        `}
      >
        Browser actions ({actions.length})
        <NewActionMenu onAddAction={onAddAction} />
      </Heading>
      <ScrollArea>
        {actions.length === 0 ? (
          <EmptyMessage message="Build your browser test by adding actions." />
        ) : (
          actions.map((action) => (
            <EditableAction
              key={action.id}
              action={action}
              onRemove={onRemoveAction}
              onUpdate={onUpdateAction}
            />
          ))
        )}
      </ScrollArea>
    </Flex>
  )
}
