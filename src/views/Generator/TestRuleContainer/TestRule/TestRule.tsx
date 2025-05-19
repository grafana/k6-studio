import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { css } from '@emotion/react'
import { Flex, Grid, IconButton } from '@radix-ui/themes'
import { GripVerticalIcon } from 'lucide-react'

import type { TestRule } from '@/types/rules'

import { TestRuleActions } from './TestRuleActions'
import { TestRuleInlineContent } from './TestRuleInlineContent'
import { TestRuleToggle } from './TestRuleToggle'
import { TestRuleTypeBadge } from './TestRuleTypeBadge'

interface TestRuleItemProps {
  rule: TestRule
  isSelected: boolean
  onSelect?: () => void
}

enum Position {
  Before = -1,
  After = 1,
}

export function TestRuleItem({
  rule,
  isSelected,
  onSelect,
}: TestRuleItemProps) {
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
    id: rule.id,
  })

  const insertPosition =
    over?.id === rule.id
      ? index > activeIndex
        ? Position.After
        : Position.Before
      : undefined

  return (
    <Grid
      ref={setNodeRef}
      gap="2"
      align="center"
      p="2"
      onClick={onSelect}
      css={css`
        position: relative;
        transition: ${transition};
        transform: ${isSorting ? undefined : CSS.Translate.toString(transform)};
        border-bottom: 1px solid var(--gray-3);
        background-color: ${isSelected ? 'var(--accent-2)' : 'unset'};
        opacity: ${isDragging ? 0.5 : 1};
        grid-column: 1 / -1;
        grid-template-columns: subgrid;

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
      <IconButton
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
      <TestRuleTypeBadge rule={rule} />
      <Flex gap="2" overflow="hidden">
        <TestRuleInlineContent rule={rule} />
      </Flex>
      <TestRuleToggle ruleId={rule.id} isEnabled={rule.enabled} />
      <TestRuleActions ruleId={rule.id} />
    </Grid>
  )
}
