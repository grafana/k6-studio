import { Box, IconButton } from '@radix-ui/themes'
import { css } from '@emotion/react'
import { Allotment } from 'allotment'
import { Outlet, useLocation } from 'react-router-dom'

import { Sidebar } from './Sidebar'
import { ActivityBar } from './ActivityBar'
import { useEffect } from 'react'
import { PinRightIcon } from '@radix-ui/react-icons'
import { useLocalStorage } from 'react-use'

export function Layout() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useLocalStorage(
    'isSidebarExpanded',
    true
  )
  const location = useLocation()

  const handleVisibleChange = (index: number, visible: boolean) => {
    if (index !== 1) return
    setIsSidebarExpanded(visible)
  }

  useEffect(() => {
    window.studio.app.changeRoute(location.pathname)
  }, [location])

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
          preferredSize={280}
          visible={isSidebarExpanded}
          snap
        >
          <Sidebar
            isExpanded={isSidebarExpanded}
            onCollapseSidebar={() => setIsSidebarExpanded(false)}
          />
        </Allotment.Pane>

        <Allotment.Pane>
          <Outlet />
        </Allotment.Pane>
      </Allotment>
    </Box>
  )
}
