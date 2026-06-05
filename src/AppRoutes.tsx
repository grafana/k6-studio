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
const FileViewer = lazy(() =>
  import('@/views/FileViewer').then((module) => ({
    default: module.FileViewer,
  }))
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
      <Route path={routeMap.file} element={<FileViewer />} />
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
