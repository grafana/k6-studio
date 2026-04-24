import { generatePath } from 'react-router-dom'

import { StudioFileType } from '@/types'
import { exhaustive } from '@/utils/typescript'

const routes = {
  home: '/',
  recorder: '/recorder',
  recordingPreviewer: '/recording-previewer/:filePath',
  validator: '/validator/:filePath?',
  generator: '/generator/:filePath',
  browserTestEditor: '/editor/:filePath',
  dataFilePreviewer: '/data-file/:filePath',
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
  browserTestEditor: getRoutePath('browserTestEditor'),
  validator: getRoutePath('validator'),
  dataFilePreviewer: getRoutePath('dataFilePreviewer'),
}

export function getViewPath(type: StudioFileType, filePath: string) {
  const encodedFilePath = encodeURIComponent(filePath)

  switch (type) {
    case 'recording':
      return getRoutePath('recordingPreviewer', { filePath: encodedFilePath })

    case 'generator':
      return getRoutePath('generator', { filePath: encodedFilePath })

    case 'browser-test':
      return getRoutePath('browserTestEditor', { filePath: encodedFilePath })

    case 'script':
      return getRoutePath('validator', { filePath: encodedFilePath })

    case 'data-file':
      return getRoutePath('dataFilePreviewer', { filePath: encodedFilePath })

    default:
      return exhaustive(type)
  }
}
