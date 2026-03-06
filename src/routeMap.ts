import { generatePath } from 'react-router-dom'

const routes = {
  home: '/',
  recorder: '/recorder',
  editorView: '/file/:path',
  validator: '/validator/:path?',
  generator: '/generator/:path',
  browserTestEditor: '/editor/:path',
  dataFilePreviewer: '/data-file/:path',
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
  editorView: getRoutePath('editorView'),
  generator: getRoutePath('generator'),
  browserTestEditor: getRoutePath('browserTestEditor'),
  validator: getRoutePath('validator'),
  dataFilePreviewer: getRoutePath('dataFilePreviewer'),
}
