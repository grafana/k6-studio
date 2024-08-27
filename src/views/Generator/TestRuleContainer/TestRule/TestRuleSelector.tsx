import { Badge, Code } from '@radix-ui/themes'

import { Selector } from '@/types/rules'
import { exhaustive } from '@/utils/typescript'
import { css } from '@emotion/react'

interface TestRuleSelectorProps {
  selector: Selector
}

export function TestRuleSelector({ selector }: TestRuleSelectorProps) {
  return (
    <Badge
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
