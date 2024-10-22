import { css } from '@emotion/react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Flex, Grid, IconButton } from '@radix-ui/themes'
import { DragHandleDots2Icon } from '@radix-ui/react-icons'

import type { TestRule } from '@/types/rules'
import { TestRuleActions } from './TestRuleActions'
import { TestRuleTypeBadge } from './TestRuleTypeBadge'
import { TestRuleInlineContent } from './TestRuleInlineContent'

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

        &:first-of-type {
          border-top: 1px solid var(--gray-3);
        }

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
        {...attributes}
        {...listeners}
      >
        <DragHandleDots2Icon
          color="gray"
          css={css`
            cursor: grab;
          `}
          width={16}
          height={16}
          aria-hidden
        />
      </IconButton>
      <TestRuleTypeBadge rule={rule} />
      <Flex gap="2" overflow="hidden">
        <TestRuleInlineContent rule={rule} />
      </Flex>
      <TestRuleActions ruleId={rule.id} />
    </Grid>
  )
}
