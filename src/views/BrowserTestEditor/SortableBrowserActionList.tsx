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
import { Flex, IconButton } from '@radix-ui/themes'
import { GripVerticalIcon } from 'lucide-react'
import { useState } from 'react'

import { EditableAction } from './EditableAction'
import { BrowserActionInstance } from './types'

enum Position {
  Before = -1,
  After = 1,
}

interface SortableBrowserActionListProps {
  actions: BrowserActionInstance[]
  onSwapActions: (idA: string, idB: string) => void
  onRemoveAction: (actionId: string) => void
  onChangeAction: (action: BrowserActionInstance) => void
}

export function SortableBrowserActionList({
  actions,
  onSwapActions,
  onRemoveAction,
  onChangeAction,
}: SortableBrowserActionListProps) {
  const [active, setActive] = useState<BrowserActionInstance | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active: activeItem, over } = event

    if (over && activeItem.id !== over.id) {
      onSwapActions(activeItem.id as string, over.id as string)
    }
    setActive(null)
  }

  function handleDragStart(event: DragStartEvent) {
    setActive(
      actions.find((action) => action.id === event.active.id) ?? null
    )
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
              action={action}
              onRemove={onRemoveAction}
              onChange={onChangeAction}
            />
          ))}
          <DragOverlay modifiers={[restrictToFirstScrollableAncestor]}>
            {active ? (
              <EditableAction
                action={active}
                onRemove={onRemoveAction}
                onChange={onChangeAction}
                leadingSlot={
                  <IconButton
                    size="2"
                    variant="ghost"
                    color="gray"
                    aria-hidden
                    css={css`
                      cursor: grabbing;
                    `}
                  >
                    <GripVerticalIcon color="gray" aria-hidden />
                  </IconButton>
                }
              />
            ) : null}
          </DragOverlay>
        </SortableContext>
      </DndContext>
    </Flex>
  )
}

interface SortableEditableActionProps {
  action: BrowserActionInstance
  onRemove: (actionId: string) => void
  onChange: (action: BrowserActionInstance) => void
}

function SortableEditableAction({
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
      ? index > activeIndex
        ? Position.After
        : Position.Before
      : undefined

  return (
    <Flex
      ref={setNodeRef}
      direction="column"
      css={css`
        position: relative;
        transition: ${transition};
        transform: ${isSorting ? undefined : CSS.Translate.toString(transform)};
        opacity: ${isDragging ? 0.5 : 1};
        border-bottom: 1px solid var(--studio-border-color);

        &::before {
          content: '';
          position: absolute;
          width: 100%;
          left: 0;
          top: ${insertPosition === Position.Before ? '-4px' : 'auto'};
          bottom: ${insertPosition === Position.After ? '-4px' : 'auto'};
          height: 2px;
          background: var(--accent-5);
          border-radius: var(--radius-1);
          opacity: ${insertPosition !== undefined ? 1 : 0};
        }
      `}
    >
      <EditableAction
        action={action}
        onRemove={onRemove}
        onChange={onChange}
        leadingSlot={
          <IconButton
            size="2"
            variant="ghost"
            color="gray"
            aria-label="Drag to reorder"
            css={css`
              cursor: grab;
            `}
            {...attributes}
            {...listeners}
          >
            <GripVerticalIcon color="gray" aria-hidden />
          </IconButton>
        }
      />
    </Flex>
  )
}
