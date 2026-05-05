import { css } from '@emotion/react'
import { Box, Flex, Spinner } from '@radix-ui/themes'
import { Allotment } from 'allotment'
import { Suspense, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useLocalStorage } from 'react-use'

import { useDelayedVisibility } from '@/hooks/useDelayedVisibility'
import { useListenDeepLinks } from '@/hooks/useListenDeepLinks'
import { useWatchFileChanges } from '@/hooks/useWatchFileChanges'

import { ActivityBar } from './ActivityBar'
import { SidebarTab } from './Layout.types'
import { Sidebar } from './Sidebar'

function RouteLoadingFallback() {
  const showSpinner = useDelayedVisibility()

  return (
    <Flex
      align="center"
      justify="center"
      css={css`
        width: 100%;
        height: 100%;
      `}
    >
      {showSpinner && <Spinner />}
    </Flex>
  )
}

export function Layout() {
  const [activeTab = 'record', setActiveTab] = useLocalStorage<SidebarTab>(
    'activeTab',
    'record'
  )
  const [isSidebarExpanded, setIsSidebarExpanded] = useLocalStorage(
    'isSidebarExpanded',
    true
  )
  const location = useLocation()
  useListenDeepLinks()
  useWatchFileChanges()

  const handleVisibleChange = (index: number, visible: boolean) => {
    if (index !== 1) return
    setIsSidebarExpanded(visible)
  }

  const handleTabChange = (tab: SidebarTab) => {
    setActiveTab(tab)
    setIsSidebarExpanded(true)
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
      <Allotment onVisibleChange={handleVisibleChange}>
        <Allotment.Pane minSize={64} maxSize={64}>
          <ActivityBar activeTab={activeTab} onTabChange={handleTabChange} />
        </Allotment.Pane>
        <Allotment.Pane
          minSize={200}
          maxSize={300}
          preferredSize={280}
          visible={isSidebarExpanded}
          snap
        >
          <Sidebar
            activeTab={activeTab}
            onCollapseSidebar={() => setIsSidebarExpanded(false)}
          />
        </Allotment.Pane>

        <Allotment.Pane>
          <Suspense fallback={<RouteLoadingFallback />}>
            <Outlet />
          </Suspense>
        </Allotment.Pane>
      </Allotment>
    </Box>
  )
}
