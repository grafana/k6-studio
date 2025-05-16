import { css } from '@emotion/react'
import { Badge, Code, Tooltip } from '@radix-ui/themes'
import { SearchIcon } from 'lucide-react'

import { Filter } from '@/types/rules'

interface TestRuleFilterProps {
  filter: Filter
}

export function TestRuleFilter({ filter }: TestRuleFilterProps) {
  const filterPath = filter.path || 'All requests'

  return (
    <Tooltip content={filterPath}>
      <Badge
        variant="solid"
        css={css`
          flex-shrink: 1;
          max-width: 25%;
        `}
      >
        <SearchIcon
          css={css`
            flex-shrink: 0;
          `}
        />
        <Code variant="ghost" truncate>
          {filterPath}
        </Code>
      </Badge>
    </Tooltip>
  )
}
