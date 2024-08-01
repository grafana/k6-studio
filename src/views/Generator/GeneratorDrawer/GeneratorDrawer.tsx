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
import { useGeneratorStore } from '@/store/generator'
import { RuleEditor } from './RuleEditor'

export function GeneratorDrawer() {
  const { selectedRuleId } = useGeneratorStore()

  return (
    <Flex direction="column" height="100%">
      <TabNav.Root>
        {selectedRuleId !== null && (
          <TabNavLink path={`rule/${selectedRuleId}`} label="Rule" />
        )}
        <TabNavLink path="loadProfile" label="Load profile" />
        <TabNavLink path="thinkTime" label="Think time" />
        <TabNavLink path="testData" label="Test data" />
      </TabNav.Root>
      <Routes>
        <Route path="/" element={<ScrollableContent />}>
          <Route path="/" element={<Navigate to="loadProfile" replace />} />
          <Route path="rule/:id" element={<RuleEditor />} />
          <Route path="loadProfile" element={<LoadProfile />} />
          <Route path="thinkTime" element={<ThinkTime />} />
          <Route path="testData" element={<VariablesEditor />} />
        </Route>
      </Routes>
    </Flex>
  )
}

function TabNavLink({ path, label }: { path: string; label: string }) {
  const match = useMatch(`generator/:pathp/${path}`)

  return (
    <TabNav.Link asChild active={match !== null}>
      <Link to={path}>{label}</Link>
    </TabNav.Link>
  )
}

function ScrollableContent() {
  return (
    <ScrollArea style={{ height: '100%' }}>
      <Outlet />
    </ScrollArea>
  )
}
