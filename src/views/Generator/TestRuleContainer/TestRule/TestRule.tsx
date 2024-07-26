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

export function TestRuleItem({ rule, isSelected }: TestRuleItemProps) {
  const {
    attributes,
    listeners,
    isDragging,
    isSorting,
    transform,
    transition,
    setNodeRef,
  } = useSortable({
    id: rule.id,
  })

  return (
    <Flex
      ref={setNodeRef}
      gap="2"
      align="center"
      p="1"
      style={{
        transition,
        transform: isSorting ? undefined : CSS.Translate.toString(transform),
        borderRadius: 'var(--radius-1)',
        border: '1px solid transparent',
        borderColor: isSelected ? 'var(--accent-5)' : 'transparent',
        backgroundColor: isSelected ? 'var(--accent-3)' : 'var(--gray-2)',
        opacity: isDragging ? 0.5 : 1,
      }}
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
