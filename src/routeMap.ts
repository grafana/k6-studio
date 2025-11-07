import { generatePath as baseGeneratePath, PathParam } from 'react-router-dom'

export const routes = {
  home: '/',
  recorder: '/recorder',
  recordingPreviewer: '/recording-previewer/:fileName',
  validator: '/validator/:fileName?',
  generator: '/generator/:fileName',
  dataFilePreviewer: '/data-file/:fileName',
} as const

export type Route = typeof routes
export type RouteName = keyof Route

function getRoute(name: RouteName): string {
  return routes[name]
}

export function getRoutePath(
  name: RouteName,
  params?: Record<string, string | number> | 0 | false | null
) {
  return params ? baseGeneratePath(getRoute(name), params) : getRoute(name)
}

export function generatePath<R extends Route[RouteName]>(
  route: R,
  params: { [K in PathParam<R>]: string }
) {
  return baseGeneratePath(route, params)
}

export const routeMap = {
  home: getRoutePath('home'),
  recorder: getRoutePath('recorder'),
  recordingPreviewer: getRoutePath('recordingPreviewer'),
  generator: getRoutePath('generator'),
  validator: getRoutePath('validator'),
  dataFilePreviewer: getRoutePath('dataFilePreviewer'),
}
