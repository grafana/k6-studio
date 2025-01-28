import { generatePath } from 'react-router-dom'

const routes = {
  home: '/',
  recorder: '/recorder',
  recordingPreviewer: '/recording-previewer/:fileName',
  validator: '/validator/:fileName?',
  generator: '/generator/:fileName',
  dataFilePreviewer: '/data-file/:fileName',
}

export type RouteName = keyof typeof routes

function getRoute(name: RouteName) {
  return routes[name]
}

export function getRoutePath(
  name: RouteName,
  params?: Record<string, string | number> | 0 | false | null
) {
  return params ? generatePath(getRoute(name), params) : getRoute(name)
}

export const routeMap = {
  home: getRoutePath('home'),
  recorder: getRoutePath('recorder'),
  recordingPreviewer: getRoutePath('recordingPreviewer'),
  generator: getRoutePath('generator'),
  validator: getRoutePath('validator'),
  dataFilePreviewer: getRoutePath('dataFilePreviewer'),
}
