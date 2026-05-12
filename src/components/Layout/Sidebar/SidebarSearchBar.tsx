import { Box } from '@radix-ui/themes'

import { SearchField } from '@/components/SearchField'

interface SidebarSearchBarProps {
  filter: string
  placeholder: string
  onChange: (filter: string) => void
}

export function SidebarSearchBar({
  filter,
  placeholder,
  onChange,
}: SidebarSearchBarProps) {
  return (
    <Box p="3" css={{ borderBottom: '1px solid var(--gray-a3)' }}>
      <SearchField
        filter={filter}
        placeholder={placeholder}
        onChange={onChange}
      />
    </Box>
  )
}
