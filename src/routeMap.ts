import { generatePath } from 'react-router-dom'

const routes = {
  // Home
  home: '/',

  // Recorder
  recorder: '/recorder',

  // Recording Previewer
  recordingPreviewer: '/recording-previewer/:path',

  // Validator
  validator: '/validator/:path?',

  // Generator
  generator: '/generator/:path/',
  rule: '/generator/:path/rule/:ruleId',
  loadProfile: '/generator/:path/loadProfile',
  thinkTime: '/generator/:path/thinkTime',
  testData: '/generator/:path/testData',
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
  recordingPreviewer: getRoutePath('recordingPreviewer', { path: ':path' }),
  generator: {
    root: getRoutePath('generator', { path: ':path' }),
    rule: getRoutePath('rule', { path: ':path', ruleId: ':ruleId' }),
    loadProfile: getRoutePath('loadProfile', { path: ':path' }),
    thinkTime: getRoutePath('thinkTime', { path: ':path' }),
    testData: getRoutePath('testData', { path: ':path' }),
  },
  validator: getRoutePath('validator', { path: ':path' }),
}