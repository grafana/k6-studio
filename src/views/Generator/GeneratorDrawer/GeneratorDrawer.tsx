import { Box, Flex, ScrollArea, TabNav } from '@radix-ui/themes'
import { Link, Outlet, useMatch } from 'react-router-dom'

import { useGeneratorParams } from '../Generator.hooks'
import { getRoutePath, RouteName } from '@/routeMap'

export function GeneratorDrawer() {
  const { fileName: decodedFileName, ruleId } = useGeneratorParams()
  const fileName = encodeURIComponent(decodedFileName)

  return (
    <Flex direction="column" height="100%">
      <TabNav.Root>
        {ruleId !== undefined && (
          <TabNavLink
            route="rule"
            params={{
              fileName,
              ruleId,
            }}
            label="Rule"
          />
        )}
        <TabNavLink
          route="loadProfile"
          params={{
            fileName,
          }}
          label="Load profile"
        />
        <TabNavLink
          route="thinkTime"
          params={{
            fileName,
          }}
          label="Think time"
        />
        <TabNavLink
          route="testData"
          params={{
            fileName,
          }}
          label="Test data"
        />
      </TabNav.Root>
      <ScrollArea style={{ height: '100%' }}>
        <Box p="3">
          <Outlet />
        </Box>
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
