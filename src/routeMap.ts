import { generatePath } from 'react-router-dom'

const routes = {
  // Home
  home: '/',

  // Recorder
  recorder: '/recorder',

  // Recording Previewer
  recordingPreviewer: '/recording-previewer/:fileName',

  // Validator
  validator: '/validator/:fileName?',

  // Generator
  generator: '/generator/:fileName',
  rule: '/generator/:fileName/rule/:ruleId',
  loadProfile: '/generator/:fileName/loadProfile',
  thinkTime: '/generator/:fileName/thinkTime',
  testData: '/generator/:fileName/testData',
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
  generator: {
    root: getRoutePath('generator'),
    rule: getRoutePath('rule'),
    loadProfile: getRoutePath('loadProfile'),
    thinkTime: getRoutePath('thinkTime'),
    testData: getRoutePath('testData'),
  },
  validator: getRoutePath('validator'),
}
