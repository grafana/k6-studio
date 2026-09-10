import { generatePath } from 'react-router-dom'

const routes = {
  home: '/',
  recorder: '/recorder',
  file: '/file/:filePath',
}

export type RouteName = keyof typeof routes

function getRoute(name: RouteName) {
  return routes[name]
}

export function getRoutePath(
  name: RouteName,
  params?: Record<string, string> | 0 | false | null
) {
  return params ? generatePath(getRoute(name), params) : getRoute(name)
}

export const routeMap = {
  home: getRoutePath('home'),
  recorder: getRoutePath('recorder'),
  file: getRoutePath('file'),
}

export function getViewPath(filePath: string) {
  // generatePath encodes params itself as of react-router v7, so pre-encoding
  // here would double-encode the path and leave `%20` in it once useParams
  // decodes a single level.
  return getRoutePath('file', { filePath })
}
