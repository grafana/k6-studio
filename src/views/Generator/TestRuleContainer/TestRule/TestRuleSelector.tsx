import { Badge, Code } from '@radix-ui/themes'

import { Selector } from '@/types/rules'
import { TargetIcon } from '@radix-ui/react-icons'
import { exhaustive } from '@/utils/typescript'

interface TestRuleSelectorProps {
  selector: Selector
}

export function TestRuleSelector({ selector }: TestRuleSelectorProps) {
  return (
    <Badge radius="full">
      <TargetIcon width={15} height={15} />
      <SelectorContent selector={selector} /> from {selector.from}
    </Badge>
  )
}

function SelectorContent({ selector }: { selector: Selector }) {
  switch (selector.type) {
    case 'json':
      return <Code>{selector.path}</Code>
    case 'begin-end':
      return (
        <>
          between <Code>{selector.begin}</Code> and <Code>{selector.end}</Code>
        </>
      )
    case 'regex':
      return <Code>{selector.regex}</Code>
    default:
      return exhaustive(selector)
  }
}
