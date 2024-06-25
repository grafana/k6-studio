import { Box, Flex, ScrollArea } from '@radix-ui/themes'
import { Outlet } from 'react-router-dom'
import { SidebarNav } from './SidebarNav'

export function Layout() {
  return (
    <Flex overflow="hidden" maxWidth="100%">
      <SidebarNav />

      <Flex flexGrow="1" style={{ backgroundColor: 'var(--gray-3)' }} asChild>
        <ScrollArea style={{ height: '100dvh' }} scrollbars="vertical">
          <Box
            style={{
              backgroundColor: '#fff',
              borderRadius: 'var(--radius-1)',
              border: '1px solid var(--gray-4)',
            }}
            p="4"
            m="4"
          >
            <Outlet />
          </Box>
        </ScrollArea>
      </Flex>
    </Flex>
  )
}
