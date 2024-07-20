import { Badge } from '@radix-ui/themes'

import { Filter } from '@/types/rules'
import { MagnifyingGlassIcon } from '@radix-ui/react-icons'

interface TestRuleFilterProps {
  filter: Filter
}

export function TestRuleFilter({ filter }: TestRuleFilterProps) {
  return (
    <Badge color="cyan">
      <MagnifyingGlassIcon width={15} height={15} />
      {filter.path || 'all requests'}
    </Badge>
  )
}
