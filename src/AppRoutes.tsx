import log from 'electron-log/renderer'
import { lazy } from 'react'
import {
  Navigate,
  Route,
  useLocation,
  createHashRouter,
  createRoutesFromChildren,
  RouterProvider,
} from 'react-router-dom'

import { Layout } from '@/components/Layout/Layout'

import { ErrorElement } from './ErrorElement'
import { routeMap } from './routeMap'

const Home = lazy(() =>
  import('@/views/Home').then((module) => ({ default: module.Home }))
)
const Recorder = lazy(() =>
  import('@/views/Recorder').then((module) => ({ default: module.Recorder }))
)
const RecordingPreviewer = lazy(() =>
  import('@/views/RecordingPreviewer').then((module) => ({
    default: module.RecordingPreviewer,
  }))
)
const Generator = lazy(() =>
  import('@/views/Generator').then((module) => ({ default: module.Generator }))
)
const BrowserTestEditor = lazy(() =>
  import('@/views/BrowserTestEditor').then((module) => ({
    default: module.BrowserTestEditor,
  }))
)
const Validator = lazy(() =>
  import('@/views/Validator').then((module) => ({ default: module.Validator }))
)
const ValidatorRunPreviewer = lazy(() =>
  import('@/views/ValidatorRunPreviewer').then((module) => ({
    default: module.ValidatorRunPreviewer,
  }))
)
const DataFile = lazy(() =>
  import('@/views/DataFile').then((module) => ({ default: module.DataFile }))
)

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
      <Route
        path={routeMap.browserTestEditor}
        element={<BrowserTestEditor />}
      />
      <Route path={routeMap.validator} element={<Validator />} />
      <Route
        path={routeMap.validatorRunPreviewer}
        element={<ValidatorRunPreviewer />}
      />
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
