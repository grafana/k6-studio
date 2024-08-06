import { HashRouter, Navigate, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/Layout/Layout'
import { Home } from '@/views/Home'
import { Recorder } from '@/views/Recorder'
import { RecordingPreviewer } from '@/views/RecordingPreviewer'
import { Generator } from '@/views/Generator/Generator'
import { GeneratorDrawer } from '@/views/Generator/GeneratorDrawer'
import { RuleEditor } from '@/views/Generator/GeneratorDrawer/RuleEditor'
import { LoadProfile } from '@/views/Generator/GeneratorDrawer/LoadProfile'
import { ThinkTime } from '@/views/Generator/GeneratorDrawer/ThinkTime'
import { VariablesEditor } from '@/views/Generator/GeneratorDrawer/VariablesEditor'
import { Validator } from '@/views/Validator'
import { routeMap } from './routeMap'

export function AppRoutes() {
  return (
    <HashRouter>
      <Routes>
        <Route path={routeMap.home} element={<Layout />}>
          <Route index element={<Home />} />
          <Route path={routeMap.recorder} element={<Recorder />} />
          <Route
            path={routeMap.recordingPreviewer}
            element={<RecordingPreviewer />}
          />
          <Route path={routeMap.generator.root} element={<Generator />}>
            <Route element={<GeneratorDrawer />}>
              <Route
                path=""
                element={
                  <Navigate to={routeMap.generator.loadProfile} replace />
                }
              />
              <Route path={routeMap.generator.rule} element={<RuleEditor />} />
              <Route
                path={routeMap.generator.loadProfile}
                element={<LoadProfile />}
              />
              <Route
                path={routeMap.generator.thinkTime}
                element={<ThinkTime />}
              />
              <Route
                path={routeMap.generator.testData}
                element={<VariablesEditor />}
              />
            </Route>
          </Route>
          <Route path={routeMap.validator} element={<Validator />} />
          <Route path="*" element={<Navigate to={routeMap.home} replace />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
