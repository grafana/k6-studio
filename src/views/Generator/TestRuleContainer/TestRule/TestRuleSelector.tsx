import { Badge, Code, Tooltip } from '@radix-ui/themes'
import { css } from '@emotion/react'

import { Selector } from '@/types/rules'
import { exhaustive } from '@/utils/typescript'
import { useOverflowCheck } from '@/hooks/useOverflowCheck'
import { useRef } from 'react'

interface TestRuleSelectorProps {
  selector: Selector
}

export function TestRuleSelector({ selector }: TestRuleSelectorProps) {
  const ref = useRef<HTMLDivElement>(null)
  const hasEllipsis = useOverflowCheck(ref)

  return (
    <Tooltip
      content={
        <>
          <SelectorContent selector={selector} /> from {selector.from}
        </>
      }
      hidden={!hasEllipsis}
    >
      <Badge
        ref={ref}
        color="gray"
        css={css`
          flex-shrink: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        `}
      >
        <SelectorContent selector={selector} /> from {selector.from}
      </Badge>
    </Tooltip>
  )
}

function SelectorContent({ selector }: { selector: Selector }) {
  switch (selector.type) {
    case 'json':
      return <Code truncate>{selector.path}</Code>
    case 'begin-end':
      return (
        <>
          between <Code truncate>{selector.begin}</Code> and{' '}
          <Code truncate>{selector.end}</Code>
        </>
      )
    case 'regex':
      return <Code truncate>{selector.regex}</Code>
    default:
      return exhaustive(selector)
  }
}
