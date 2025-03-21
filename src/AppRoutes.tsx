import log from 'electron-log/renderer'
import {
  Navigate,
  Route,
  useLocation,
  createHashRouter,
  createRoutesFromChildren,
  RouterProvider,
} from 'react-router-dom'

import { Layout } from '@/components/Layout/Layout'
import { Generator } from '@/views/Generator/Generator'
import { Home } from '@/views/Home'
import { Recorder } from '@/views/Recorder'
import { RecordingPreviewer } from '@/views/RecordingPreviewer'
import { Validator } from '@/views/Validator'

import { ErrorElement } from './ErrorElement'
import { routeMap } from './routeMap'
import { DataFile } from './views/DataFile'

const router = createHashRouter(
  createRoutesFromChildren(
    <Route
      path={routeMap.home}
      element={<Layout />}
      errorElement={<ErrorElement />}
    >
      <Route index element={<Home />} />
      <Route path={routeMap.recorder} element={<Recorder />} />
      <Route
        path={routeMap.recordingPreviewer}
        element={<RecordingPreviewer />}
      />
      <Route path={routeMap.generator} element={<Generator />} />
      <Route path={routeMap.validator} element={<Validator />} />
      <Route path={routeMap.dataFilePreviewer} element={<DataFile />} />
      <Route path="*" element={<NoRouteFound />} />
    </Route>
  )
)

export function AppRoutes() {
  return <RouterProvider router={router} />
}

function NoRouteFound() {
  const location = useLocation()

  log.error(`No route found for ${location.pathname}`)

  return <Navigate to={routeMap.home} replace />
}
