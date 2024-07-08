import { Box, Flex } from '@radix-ui/themes'
import { Allotment } from 'allotment'
import { Outlet } from 'react-router-dom'
import { useDrawer } from '@/hooks/useDrawer'
import { Drawer } from '@/components/Drawer'

export function Layout() {
  const leftDrawer = useDrawer('left')
  const rightDrawer = useDrawer('right')
  const bottomDrawer = useDrawer('bottom')

  return (
    <Box height="100dvh">
      <Allotment>
        <Allotment.Pane
          minSize={200}
          preferredSize={400}
          visible={leftDrawer.isOpen}
        >
          <Drawer close={leftDrawer.close}>{leftDrawer.content}</Drawer>
        </Allotment.Pane>
        <Allotment.Pane>
          <Allotment vertical>
            <Allotment.Pane>
              <Flex
                direction="column"
                overflow="hidden"
                maxWidth="100%"
                height="100dvh"
              >
                <Outlet />
              </Flex>
            </Allotment.Pane>
            <Allotment.Pane visible={bottomDrawer.isOpen}>
              <Drawer close={rightDrawer.close}>{bottomDrawer.content}</Drawer>
            </Allotment.Pane>
          </Allotment>
        </Allotment.Pane>
        <Allotment.Pane
          minSize={200}
          preferredSize={200}
          visible={rightDrawer.isOpen}
        >
          <Drawer close={rightDrawer.close}>{rightDrawer.content}</Drawer>
        </Allotment.Pane>
      </Allotment>
    </Box>
  )
}
