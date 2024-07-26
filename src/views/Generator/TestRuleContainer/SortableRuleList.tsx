import { Flex } from '@radix-ui/themes'
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
} from '@dnd-kit/sortable'

import { TestRuleItem } from './TestRule'
import { TestRule } from '@/types/rules'
import { useState } from 'react'

interface SortableRuleListProps {
  rules: TestRule[]
  selectedRuleId: string | null
  onSwapRules: (idA: string, idB: string) => void
}

export function SortableRuleList({
  rules,
  selectedRuleId,
  onSwapRules,
}: SortableRuleListProps) {
  const [active, setActive] = useState<TestRule | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over?.id) {
      onSwapRules(active.id as string, over.id as string)
    }
  }

  function handleDragStart(event: DragStartEvent) {
    setActive(rules.find((rule) => rule.id === event.active.id) || null)
  }

  return (
    <Flex direction="column" gap="1">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext items={rules} strategy={verticalListSortingStrategy}>
          {rules.map((rule) => (
            <TestRuleItem
              rule={rule}
              isSelected={rule.id === selectedRuleId}
              key={rule.id}
            />
          ))}
          <DragOverlay modifiers={[restrictToFirstScrollableAncestor]}>
            {active ? (
              <TestRuleItem
                rule={active}
                isSelected={active.id === selectedRuleId}
              />
            ) : null}
          </DragOverlay>
        </SortableContext>
      </DndContext>
    </Flex>
  )
}
