import { Flex, ScrollArea, TabNav } from '@radix-ui/themes'
import {
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
  useMatch,
} from 'react-router-dom'

import { LoadProfile } from './LoadProfile'
import { VariablesEditor } from './VariablesEditor'
import { ThinkTime } from './ThinkTime'
import { RuleEditor } from './RuleEditor'
import { useGeneratorParams } from '../Generator.hooks'

export function GeneratorDrawer() {
  return (
    <Routes>
      <Route path="/" element={<GeneratorDrawerLayout />}>
        <Route path="/" element={<Navigate to="loadProfile" replace />} />
        <Route path="rule/:ruleId" element={<RuleEditor />} />
        <Route path="loadProfile" element={<LoadProfile />} />
        <Route path="thinkTime" element={<ThinkTime />} />
        <Route path="testData" element={<VariablesEditor />} />
      </Route>
    </Routes>
  )
}

function TabNavLink({ to, label }: { to: string; label: string }) {
  const match = useMatch(`generator/:path/${to}`)

  return (
    <TabNav.Link asChild active={match !== null}>
      <Link to={to}>{label}</Link>
    </TabNav.Link>
  )
}

function GeneratorDrawerLayout() {
  const { ruleId } = useGeneratorParams()

  return (
    <Flex direction="column" height="100%">
      <TabNav.Root>
        {ruleId !== undefined && (
          <TabNavLink to={`rule/${ruleId}`} label="Rule" />
        )}
        <TabNavLink to="loadProfile" label="Load profile" />
        <TabNavLink to="thinkTime" label="Think time" />
        <TabNavLink to="testData" label="Test data" />
      </TabNav.Root>
      <ScrollArea style={{ height: '100%' }}>
        <Outlet />
      </ScrollArea>
    </Flex>
  )
}
