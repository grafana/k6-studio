import { css } from '@emotion/react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Flex, IconButton } from '@radix-ui/themes'
import { DragHandleDots2Icon } from '@radix-ui/react-icons'

import type { TestRule } from '@/types/rules'
import { TestRuleActions } from './TestRuleActions'
import { TestRuleTypeBadge } from './TestRuleTypeBadge'
import { TestRuleInlineContent } from './TestRuleInlineContent'

interface TestRuleItemProps {
  rule: TestRule
  isSelected: boolean
}

enum Position {
  Before = -1,
  After = 1,
}

export function TestRuleItem({ rule, isSelected }: TestRuleItemProps) {
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
    <Flex
      ref={setNodeRef}
      gap="2"
      align="center"
      p="1"
      css={css`
        position: relative;
        transition: ${transition};
        transform: ${isSorting ? undefined : CSS.Translate.toString(transform)};
        border-radius: var(--radius-1);
        border: 1px solid transparent;
        border-color: ${isSelected ? 'var(--accent-5)' : 'transparent'};
        background-color: ${isSelected ? 'var(--accent-3)' : 'var(--gray-2)'};
        opacity: ${isDragging ? 0.5 : 1};

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
      <IconButton variant="ghost" color="gray" {...attributes} {...listeners}>
        <DragHandleDots2Icon
          color="gray"
          css={css`
            cursor: grab;
          `}
          aria-hidden
        />
      </IconButton>
      <TestRuleTypeBadge rule={rule} />
      <TestRuleInlineContent rule={rule} />
      <TestRuleActions ruleId={rule.id} />
    </Flex>
  )
}
