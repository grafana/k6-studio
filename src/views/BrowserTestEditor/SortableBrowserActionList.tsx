import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core'
import {
  restrictToVerticalAxis,
  restrictToFirstScrollableAncestor,
} from '@dnd-kit/modifiers'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { css } from '@emotion/react'
import { Flex } from '@radix-ui/themes'
import { useState } from 'react'

import { BrowserDebuggerEvent } from '@/main/runner/schema'
import { AnyBrowserAction } from '@/schemas/browserTest'

import { EditableAction } from './EditableAction'
import { EditableActionDragHandle } from './EditableActionDragHandle'
import { BrowserActionStates } from './types'

enum Position {
  Before = 'before',
  After = 'after',
}

interface SortableBrowserActionListProps {
  states: BrowserActionStates
  actions: AnyBrowserAction[]
  onReorderActions: (activeId: string, overId: string) => void
  onRemoveAction: (actionId: string) => void
  onChangeAction: (action: AnyBrowserAction) => void
}

export function SortableBrowserActionList({
  states,
  actions,
  onReorderActions,
  onRemoveAction,
  onChangeAction,
}: SortableBrowserActionListProps) {
  const [active, setActive] = useState<AnyBrowserAction | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active: activeItem, over } = event

    if (over && activeItem.id !== over.id) {
      onReorderActions(activeItem.id as string, over.id as string)
    }

    setActive(null)
  }

  function handleDragStart(event: DragStartEvent) {
    setActive(actions.find((action) => action.id === event.active.id) ?? null)
  }

  return (
    <Flex direction="column">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragCancel={() => {
          setActive(null)
        }}
        onDragStart={handleDragStart}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext items={actions} strategy={verticalListSortingStrategy}>
          {actions.map((action) => (
            <SortableEditableAction
              key={action.id}
              state={states[action.id]?.[0]}
              action={action}
              onChange={onChangeAction}
              onRemove={onRemoveAction}
            />
          ))}
          <DragOverlay modifiers={[restrictToFirstScrollableAncestor]}>
            {active ? (
              <EditableAction
                state={states[active.id]?.[0]}
                action={active}
                dragHandle={<EditableActionDragHandle overlay />}
                onChange={onChangeAction}
                onRemove={onRemoveAction}
              />
            ) : null}
          </DragOverlay>
        </SortableContext>
      </DndContext>
    </Flex>
  )
}

interface SortableEditableActionProps {
  state: BrowserDebuggerEvent | undefined
  action: AnyBrowserAction
  onRemove: (actionId: string) => void
  onChange: (action: AnyBrowserAction) => void
}

function SortableEditableAction({
  state,
  action,
  onRemove,
  onChange,
}: SortableEditableActionProps) {
  const {
    attributes,
    listeners,
    isDragging,
    isSorting,
    transform,
    transition,
    over,
    index,
    activeIndex,
    setNodeRef,
  } = useSortable({
    id: action.id,
  })

  const insertPosition =
    over?.id === action.id
      ? index === activeIndex
        ? undefined
        : index > activeIndex
          ? Position.After
          : Position.Before
      : undefined

  return (
    <Flex
      ref={setNodeRef}
      direction="column"
      data-position={insertPosition}
      css={css`
        position: relative;
        transition: ${transition};
        transform: ${isSorting ? undefined : CSS.Translate.toString(transform)};
        opacity: ${isDragging ? 0.5 : 1};
        border-bottom: 1px solid var(--studio-border-color);

        &::before,
        &::after {
          content: '';
          position: absolute;
          background: var(--accent-5);
          width: 100%;
          height: 2px;
          opacity: 0;
        }

        &::before {
          top: 0px;
        }

        &::after {
          bottom: 0px;
        }

        &[data-position='before']::before {
          opacity: 1;
        }

        &[data-position='after']::after {
          opacity: 1;
        }
      `}
    >
      <EditableAction
        state={state}
        action={action}
        dragHandle={<EditableActionDragHandle {...attributes} {...listeners} />}
        onChange={onChange}
        onRemove={onRemove}
      />
    </Flex>
  )
}
