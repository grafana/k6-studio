import { Box, Flex, IconButton } from '@radix-ui/themes'
import { Allotment } from 'allotment'
import { Outlet } from 'react-router-dom'
import { Cross2Icon } from '@radix-ui/react-icons'
import { useSidebar } from '@/hooks/useSidebar'

export function Layout() {
  const { content, isOpen, close } = useSidebar()
  return (
    <Box height="100dvh">
      <Allotment>
        <Allotment.Pane>
          <Flex
            direction="column"
            overflow="hidden"
            maxWidth="100%"
            height="100dvh"
            p="2"
          >
            <Outlet />
          </Flex>
        </Allotment.Pane>
        <Allotment.Pane minSize={200} preferredSize={400} visible={isOpen}>
          <Box p="2" position="absolute" right="0" top="0">
            <IconButton size="1" variant="ghost" onClick={close}>
              <Cross2Icon />
            </IconButton>
          </Box>
          <Box height="100%" pt="9px">
            {content}
          </Box>
        </Allotment.Pane>
      </Allotment>
    </Box>
  )
}
