import { css } from '@emotion/react'
import { MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { Badge, Code, Tooltip } from '@radix-ui/themes'

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
        <MagnifyingGlassIcon
          width={15}
          height={15}
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
