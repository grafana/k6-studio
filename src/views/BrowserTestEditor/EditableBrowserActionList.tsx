import { css } from '@emotion/react'
import { Button, Flex, Heading, ScrollArea } from '@radix-ui/themes'
import { CirclePlusIcon } from 'lucide-react'

import { EmptyMessage } from '@/components/EmptyMessage'
import { AnyBrowserAction } from '@/main/runner/schema'

import { EditableAction } from './EditableAction'
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
        {actions.length !== 0 && (
          <Flex px="4" py="2">
            <NewActionMenu
              onAddAction={onAddAction}
              trigger={
                <Button variant="ghost" color="gray">
                  <CirclePlusIcon /> Add action
                </Button>
              }
            />
          </Flex>
        )}
      </Heading>
      <ScrollArea>
        {actions.length === 0 ? (
          <EmptyMessage
            message="Build your browser test by adding actions."
            action={
              <NewActionMenu
                onAddAction={onAddAction}
                trigger={
                  <Button>
                    <CirclePlusIcon /> Add action
                  </Button>
                }
              />
            }
          />
        ) : (
          actions.map((action, index) => (
            <EditableAction key={index} action={action} />
          ))
        )}
      </ScrollArea>
    </Flex>
  )
}
