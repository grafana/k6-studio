import { Flex, ScrollArea, TabNav } from '@radix-ui/themes'
import { Link, Outlet, useMatch } from 'react-router-dom'

import { useGeneratorParams } from '../Generator.hooks'
import { getRoutePath, RouteName } from '@/routeMap'

export function GeneratorDrawer() {
  const { path: decodedPath, ruleId } = useGeneratorParams()
  const path = encodeURIComponent(decodedPath)

  return (
    <Flex direction="column" height="100%">
      <TabNav.Root>
        {ruleId !== undefined && (
          <TabNavLink
            route="rule"
            params={{
              path,
              ruleId,
            }}
            label="Rule"
          />
        )}
        <TabNavLink
          route="loadProfile"
          params={{
            path,
          }}
          label="Load profile"
        />
        <TabNavLink
          route="thinkTime"
          params={{
            path,
          }}
          label="Think time"
        />
        <TabNavLink
          route="testData"
          params={{
            path,
          }}
          label="Test data"
        />
      </TabNav.Root>
      <ScrollArea style={{ height: '100%' }}>
        <Outlet />
      </ScrollArea>
    </Flex>
  )
}

interface TabNavLinkProps {
  route: RouteName
  params: Record<string, string | number> | 0 | false | null
  label: string
}

function TabNavLink({ route, params, label }: TabNavLinkProps) {
  const match = useMatch(getRoutePath(route))

  return (
    <TabNav.Link asChild active={match !== null}>
      <Link to={getRoutePath(route, params)}>{label}</Link>
    </TabNav.Link>
  )
}
