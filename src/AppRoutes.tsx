import {
  Navigate,
  Route,
  useLocation,
  createHashRouter,
  createRoutesFromChildren,
  RouterProvider,
} from 'react-router-dom'
import { Layout } from '@/components/Layout/Layout'
import { Home } from '@/views/Home'
import { Recorder } from '@/views/Recorder'
import { RecordingPreviewer } from '@/views/RecordingPreviewer'
import { Generator } from '@/views/Generator/Generator'
import { Validator } from '@/views/Validator'
import { routeMap } from './routeMap'
import { Settings } from './views/Settings/Settings'

const router = createHashRouter(
  createRoutesFromChildren(
    <Route path={routeMap.home} element={<Layout />}>
      <Route index element={<Home />} />
      <Route path={routeMap.settings} element={<Settings />} />
      <Route path={routeMap.recorder} element={<Recorder />} />
      <Route
        path={routeMap.recordingPreviewer}
        element={<RecordingPreviewer />}
      />
      <Route path={routeMap.generator} element={<Generator />} />
      <Route path={routeMap.validator} element={<Validator />} />
      <Route path="*" element={<NoRouteFound />} />
    </Route>
  )
)

export function AppRoutes() {
  return <RouterProvider router={router} />
}

function NoRouteFound() {
  const location = useLocation()
  console.error(`No route found for ${location.pathname}`)

  return <Navigate to={routeMap.home} replace />
}
