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
import { Flex, Grid } from '@radix-ui/themes'
import { useState } from 'react'

import { useGeneratorStore } from '@/store/generator'
import { TestRule } from '@/types/rules'

import { TestRuleItem } from './TestRule'

interface SortableRuleListProps {
  rules: TestRule[]
  onSwapRules: (idA: string, idB: string) => void
}

export function SortableRuleList({
  rules,
  onSwapRules,
}: SortableRuleListProps) {
  const [active, setActive] = useState<TestRule | null>(null)
  const selectedRuleId = useGeneratorStore((state) => state.selectedRuleId)
  const setSelectedRuleId = useGeneratorStore(
    (state) => state.setSelectedRuleId
  )
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

  function handleSelectRule(ruleId: string) {
    setSelectedRuleId(ruleId === selectedRuleId ? null : ruleId)
  }

  const gridColumns = 'auto auto 1fr auto auto'

  return (
    <Flex direction="column">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext items={rules} strategy={verticalListSortingStrategy}>
          <Grid columns={gridColumns}>
            {rules.map((rule) => (
              <TestRuleItem
                rule={rule}
                isSelected={rule.id === selectedRuleId}
                onSelect={() => {
                  handleSelectRule(rule.id)
                }}
                key={rule.id}
              />
            ))}
          </Grid>
          <DragOverlay modifiers={[restrictToFirstScrollableAncestor]}>
            {active ? (
              <Grid columns={gridColumns}>
                <TestRuleItem
                  rule={active}
                  isSelected={active.id === selectedRuleId}
                />
              </Grid>
            ) : null}
          </DragOverlay>
        </SortableContext>
      </DndContext>
    </Flex>
  )
}
