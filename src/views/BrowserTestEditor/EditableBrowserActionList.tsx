import { css } from '@emotion/react'
import {
  Button,
  DropdownMenu,
  Flex,
  Heading,
  ScrollArea,
} from '@radix-ui/themes'
import { CirclePlusIcon } from 'lucide-react'

import { EmptyMessage } from '@/components/EmptyMessage'
import { AnyBrowserAction } from '@/main/runner/schema'

import { SortableBrowserActionList } from './SortableBrowserActionList'
import { BrowserActionInstance } from './types'

interface EditableBrowserActionListProps {
  actions: BrowserActionInstance[]
  onAddAction: (method: BrowserActionInstance['method']) => void
  onRemoveAction: (actionId: string) => void
  onChangeAction: (action: BrowserActionInstance) => void
  onReorderActions: (activeId: string, overId: string) => void
}

export function EditableBrowserActionList({
  actions,
  onAddAction,
  onRemoveAction,
  onChangeAction,
  onReorderActions,
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
          <SortableBrowserActionList
            actions={actions}
            onReorderActions={onReorderActions}
            onRemoveAction={onRemoveAction}
            onChangeAction={onChangeAction}
          />
        )}
      </ScrollArea>
    </Flex>
  )
}

interface NewActionMenuProps {
  onAddAction: (method: AnyBrowserAction['method']) => void
}

function NewActionMenu({ onAddAction }: NewActionMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button variant="ghost" size="1" color="gray">
          <CirclePlusIcon /> Add action
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item
          onClick={() => {
            onAddAction('locator.click')
          }}
        >
          Click element
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onClick={() => {
            onAddAction('locator.fill')
          }}
        >
          Fill input
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onClick={() => {
            onAddAction('locator.clear')
          }}
        >
          Clear input
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onClick={() => {
            onAddAction('locator.selectOption')
          }}
        >
          Select option
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          onClick={() => {
            onAddAction('locator.check')
          }}
        >
          Check input
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onClick={() => {
            onAddAction('locator.uncheck')
          }}
        >
          Uncheck input
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          onClick={() => {
            onAddAction('locator.waitFor')
          }}
        >
          Wait for element
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onClick={() => {
            onAddAction('page.waitForTimeout')
          }}
        >
          Wait for timeout
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          onClick={() => {
            onAddAction('page.goto')
          }}
        >
          Navigate to URL
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onClick={() => {
            onAddAction('page.reload')
          }}
        >
          Reload page
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
