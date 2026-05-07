import { css } from '@emotion/react'
import {
  Box,
  Button,
  DropdownMenu,
  Flex,
  Heading,
  ScrollArea,
} from '@radix-ui/themes'
import { CirclePlusIcon } from 'lucide-react'
import { ReactNode } from 'react'

import { EmptyMessage } from '@/components/EmptyMessage'

import { SortableBrowserActionList } from './SortableBrowserActionList'
import {
  createCheckAction,
  createClearAction,
  createClickAction,
  createFillAction,
  createGoToAction,
  createPageReloadAction,
  createSelectOptionAction,
  createToBeCheckedAction,
  createUncheckAction,
  createWaitForAction,
  createWaitForTimeoutAction,
} from './actionFactories'
import { BrowserActionInstance } from './types'

interface EditableBrowserActionListProps {
  actions: BrowserActionInstance[]
  onAddAction: (action: BrowserActionInstance) => void
  onRemoveAction: (actionId: string) => void
  onChangeAction: (action: BrowserActionInstance) => void
  onReorderActions: (activeId: string, overId: string) => void
  optionsButton?: ReactNode
}

export function EditableBrowserActionList({
  actions,
  onAddAction,
  onRemoveAction,
  onChangeAction,
  onReorderActions,
  optionsButton,
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
        Actions ({actions.length})
        <NewActionMenu onAddAction={onAddAction} />
        {optionsButton && (
          <Box
            css={css`
              margin-left: auto;
            `}
          >
            {optionsButton}
          </Box>
        )}
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
  onAddAction: (action: BrowserActionInstance) => void
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
        <DropdownMenu.Item onClick={() => onAddAction(createClickAction())}>
          Click element
        </DropdownMenu.Item>
        <DropdownMenu.Item onClick={() => onAddAction(createFillAction())}>
          Fill input
        </DropdownMenu.Item>
        <DropdownMenu.Item onClick={() => onAddAction(createClearAction())}>
          Clear input
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onClick={() => onAddAction(createSelectOptionAction())}
        >
          Select option
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item onClick={() => onAddAction(createCheckAction())}>
          Check input
        </DropdownMenu.Item>
        <DropdownMenu.Item onClick={() => onAddAction(createUncheckAction())}>
          Uncheck input
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          onClick={() => onAddAction(createToBeCheckedAction())}
        >
          Expect to be checked
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item onClick={() => onAddAction(createWaitForAction())}>
          Wait for element
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onClick={() => onAddAction(createWaitForTimeoutAction())}
        >
          Wait for timeout
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item onClick={() => onAddAction(createGoToAction())}>
          Navigate to URL
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onClick={() => onAddAction(createPageReloadAction())}
        >
          Reload page
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
