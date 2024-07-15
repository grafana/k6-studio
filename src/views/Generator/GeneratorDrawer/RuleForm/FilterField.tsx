import * as Label from '@radix-ui/react-label'
import { TextField } from '@radix-ui/themes'

import type { Filter } from '@/types/rules'

interface FilterFieldProps {
  filter: Filter
  onChange: (filter: Filter) => void
}

export function FilterField({ filter, onChange }: FilterFieldProps) {
  return (
    <>
      <Label.Root htmlFor="filter-path-input">Filter</Label.Root>
      <TextField.Root
        id="filter-path-input"
        value={filter.path}
        onChange={(event) => onChange({ ...filter, path: event.target.value })}
        placeholder="Filter by path"
      />
    </>
  )
}
