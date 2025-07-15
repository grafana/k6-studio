import { css } from '@emotion/react'
import { Box, IconButton } from '@radix-ui/themes'
import { Allotment } from 'allotment'
import { PanelLeftOpenIcon } from 'lucide-react'
import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useLocalStorage } from 'react-use'

import { useListenDeepLinks } from '@/hooks/useListenDeepLinks'

import { ActivityBar } from './ActivityBar'
import { Sidebar } from './Sidebar'

export function Layout() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useLocalStorage(
    'isSidebarExpanded',
    true
  )
  const location = useLocation()
  useListenDeepLinks()

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
          <PanelLeftOpenIcon />
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
