import { Box, Flex } from '@radix-ui/themes'
import { css } from '@emotion/react'
import { Allotment } from 'allotment'
import { Outlet } from 'react-router-dom'

import { useDrawer } from '@/hooks/useDrawer'
import { Drawer } from '@/components/Drawer'
import { Sidebar } from './Sidebar'

export function Layout() {
  const rightDrawer = useDrawer('right')
  const bottomDrawer = useDrawer('bottom')

  return (
    <Box
      height="100dvh"
      css={css`
        /* Allotment */
        --focus-border: var(--accent-9);
        --separator-border: var(--gray-5);
        --sash-hover-size: 2px;
      `}
    >
      <Allotment>
        <Allotment.Pane minSize={200} preferredSize={200} maxSize={320}>
          <Sidebar />
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
            {bottomDrawer.isOpen && (
              <Allotment.Pane visible={bottomDrawer.isOpen}>
                <Drawer close={rightDrawer.close}>
                  {bottomDrawer.content}
                </Drawer>
              </Allotment.Pane>
            )}
          </Allotment>
        </Allotment.Pane>
        {rightDrawer.isOpen && (
          <Allotment.Pane
            minSize={200}
            preferredSize={200}
            visible={rightDrawer.isOpen}
          >
            <Drawer close={rightDrawer.close}>{rightDrawer.content}</Drawer>
          </Allotment.Pane>
        )}
      </Allotment>
    </Box>
  )
}
