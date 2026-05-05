import { Box } from '@radix-ui/themes'

import { SearchField } from '@/components/SearchField'

import { SIDEBAR_DIVIDER } from './Sidebar.styles'

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
    <Box p="3" css={{ borderBottom: SIDEBAR_DIVIDER }}>
      <SearchField
        filter={filter}
        placeholder={placeholder}
        onChange={onChange}
      />
    </Box>
  )
}
