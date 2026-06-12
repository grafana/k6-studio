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
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { css } from '@emotion/react'
import { Flex } from '@radix-ui/themes'
import { useState } from 'react'

import { AnyBrowserAction } from '@/schemas/browserTest'

import { EditableAction } from './EditableAction'
import { EditableActionDragHandle } from './EditableActionDragHandle'
import { useIsValidating } from './ValidationProvider'

function noop() {}

enum Position {
  Before = 'before',
  After = 'after',
}

interface SortableBrowserActionListProps {
  actions: AnyBrowserAction[]
  onChange: (actions: AnyBrowserAction[]) => void
}

export function SortableBrowserActionList({
  actions,
  onChange,
}: SortableBrowserActionListProps) {
  const isValidating = useIsValidating()
  const [active, setActive] = useState<AnyBrowserAction | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = actions.findIndex((action) => action.id === active.id)
      const newIndex = actions.findIndex((action) => action.id === over.id)

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
        return
      }

      return onChange(arrayMove(actions, oldIndex, newIndex))
    }

    setActive(null)
  }

  function handleDragStart(event: DragStartEvent) {
    setActive(actions.find((action) => action.id === event.active.id) ?? null)
  }

  const handleActionChange = (action: AnyBrowserAction) => {
    onChange(
      actions.map((target) => (target.id === action.id ? action : target))
    )
  }

  const handleActionRemove = (action: AnyBrowserAction) => {
    onChange(actions.filter((target) => target.id !== action.id))
  }

  return (
    <Flex direction="column" inert={isValidating}>
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
              onChange={handleActionChange}
              onRemove={handleActionRemove}
            />
          ))}
          <DragOverlay modifiers={[restrictToFirstScrollableAncestor]}>
            {active ? (
              <EditableAction
                action={active}
                dragHandle={<EditableActionDragHandle overlay />}
                onChange={noop}
                onRemove={noop}
              />
            ) : null}
          </DragOverlay>
        </SortableContext>
      </DndContext>
    </Flex>
  )
}

interface SortableEditableActionProps {
  action: AnyBrowserAction
  onChange: (action: AnyBrowserAction) => void
  onRemove: (action: AnyBrowserAction) => void
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
        action={action}
        dragHandle={<EditableActionDragHandle {...attributes} {...listeners} />}
        onChange={onChange}
        onRemove={onRemove}
      />
    </Flex>
  )
}
