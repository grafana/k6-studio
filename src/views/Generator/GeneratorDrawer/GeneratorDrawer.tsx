import { Flex, ScrollArea, TabNav } from '@radix-ui/themes'
import { Link, Outlet, Route, Routes, useMatch } from 'react-router-dom'

import { RequestFilters } from './RequestFilters'
import { LoadProfile } from './LoadProfile'
import { VariablesEditor } from './VariablesEditor'
import { ThinkTime } from './ThinkTime'
import { ImportSelector } from './ImportsSelector'
import { useGeneratorStore } from '@/hooks/useGeneratorStore'
import { RuleForm } from './RuleForm'

export function GeneratorDrawer() {
  const { selectedRuleId } = useGeneratorStore()

  return (
    <Flex direction="column" height="100%">
      <TabNav.Root>
        {selectedRuleId !== null && (
          <TabNavLink path={`rule/${selectedRuleId}`} label="Rule" />
        )}
        <TabNavLink path="loadProfile" label="Load profile" />
        <TabNavLink path="thresholds" label="Thresholds" />
        <TabNavLink path="thinkTime" label="Think time" />
        <TabNavLink path="testData" label="Test data" />
        <TabNavLink path="imports" label="Imports" />
        <TabNavLink path="requestFilters" label="Request filters" />
      </TabNav.Root>
      <Routes>
        <Route path="/" element={<ScrollableContent />}>
          <Route path="rule/:id" element={<RuleForm />} />
          <Route path="loadProfile" element={<LoadProfile />} />
          <Route path="thresholds" element={<VariablesEditor />} />
          <Route path="thinkTime" element={<ThinkTime />} />
          <Route path="testData" element={<VariablesEditor />} />
          <Route path="imports" element={<ImportSelector />} />
          <Route path="requestFilters" element={<RequestFilters />} />
        </Route>
      </Routes>
    </Flex>
  )
}

function TabNavLink({ path, label }: { path: string; label: string }) {
  const match = useMatch(`generator/${path}`)

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
