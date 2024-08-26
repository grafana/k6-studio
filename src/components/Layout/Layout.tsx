import { Box, IconButton } from '@radix-ui/themes'
import { css } from '@emotion/react'
import { Allotment } from 'allotment'
import { Outlet } from 'react-router-dom'

import { useDrawer } from '@/hooks/useDrawer'
import { Drawer } from '@/components/Drawer'
import { Sidebar } from './Sidebar'
import { ActivityBar } from './ActivityBar'
import { useState } from 'react'
import { PinRightIcon } from '@radix-ui/react-icons'

export function Layout() {
  const rightDrawer = useDrawer('right')
  const bottomDrawer = useDrawer('bottom')
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true)

  const handleVisibleChange = (index: number, visible: boolean) => {
    if (index !== 1) return
    setIsSidebarExpanded(visible)
  }

  return (
    <Box
      height="100dvh"
      position="relative"
      css={css`
        /* Allotment */
        --focus-border: var(--accent-9);
        --separator-border: var(--gray-5);
        --sash-hover-size: 2px;
      `}
    >
      {!isSidebarExpanded && (
        <IconButton
          size="1"
          variant="ghost"
          color="gray"
          onClick={() => setIsSidebarExpanded(true)}
          css={css`
            position: absolute;
            top: var(--space-4);
            left: 64px;
            transform: translateX(-50%);
            z-index: 10000;
          `}
        >
          <PinRightIcon />
        </IconButton>
      )}
      <Allotment onVisibleChange={handleVisibleChange}>
        <Allotment.Pane minSize={64} maxSize={64}>
          <ActivityBar />
        </Allotment.Pane>
        <Allotment.Pane
          minSize={200}
          maxSize={300}
          preferredSize={240}
          visible={isSidebarExpanded}
          snap
        >
          <Sidebar
            isExpanded={isSidebarExpanded}
            onCollapseSidebar={() => setIsSidebarExpanded(false)}
          />
        </Allotment.Pane>

        <Allotment.Pane>
          <Allotment vertical>
            <Allotment.Pane>
              <Outlet />
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
