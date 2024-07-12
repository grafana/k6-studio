import { Flex, ScrollArea, TabNav } from '@radix-ui/themes'
import { Link, Outlet, Route, Routes, useLocation } from 'react-router-dom'

import { RequestFilters } from './RequestFilters'
import { LoadProfile } from './LoadProfile'
import { VariablesEditor } from './VariablesEditor'
import { ThinkTime } from './ThinkTime'
import { ImportSelector } from './ImportsSelector'
import { useGeneratorStore } from '@/hooks/useGeneratorStore'
import { RuleForm } from './RuleForm'

export function GeneratorDrawer() {
  const { selectedRuleId } = useGeneratorStore()
  const { pathname } = useLocation()

  return (
    <Flex direction="column" height="100%">
      <TabNav.Root>
        {selectedRuleId !== null && (
          <TabNav.Link asChild active={pathname.includes('rule')}>
            <Link to={`rule/${selectedRuleId}`}>Rule</Link>
          </TabNav.Link>
        )}
        <TabNav.Link asChild active={pathname.includes('loadProfile')}>
          <Link to="loadProfile">Load profile</Link>
        </TabNav.Link>
        <TabNav.Link asChild active={pathname.includes('thresholds')}>
          <Link to="thresholds">Thresholds</Link>
        </TabNav.Link>
        <TabNav.Link asChild active={pathname.includes('thinkTime')}>
          <Link to="thinkTime">Think time</Link>
        </TabNav.Link>
        <TabNav.Link asChild active={pathname.includes('testData')}>
          <Link to="testData">Test data</Link>
        </TabNav.Link>
        <TabNav.Link asChild active={pathname.includes('imports')}>
          <Link to="imports">Imports</Link>
        </TabNav.Link>
        <TabNav.Link asChild active={pathname.includes('requestFilters')}>
          <Link to="requestFilters">Request filters</Link>
        </TabNav.Link>
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

const ScrollableContent = () => {
  return (
    <ScrollArea style={{ height: '100%' }}>
      <Outlet />
    </ScrollArea>
  )
}
