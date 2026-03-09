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
import { EditorView } from '@/views/EditorView'
import { Home } from '@/views/Home'
import { Recorder } from '@/views/Recorder'

import { ErrorElement } from './ErrorElement'
import { routeMap } from './routeMap'
import { NewGeneratorView } from './views/Generator/NewGeneratorView'

const router = createHashRouter(
  createRoutesFromChildren(
    <Route
      path={routeMap.home}
      element={<Layout />}
      errorElement={<ErrorElement />}
    >
      <Route index element={<Home />} />
      <Route path={routeMap.recorder} element={<Recorder />} />
      <Route path={routeMap.editorView} element={<EditorView />} />
      <Route path={routeMap.newGenerator} element={<NewGeneratorView />} />
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
