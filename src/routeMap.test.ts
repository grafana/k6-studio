import { describe, expect, it } from 'vitest'

import { getViewPath } from './routeMap'

describe('getViewPath', () => {
  // react-router decodes a single level when reading the param via useParams,
  // so the path has to survive exactly one decode. Pre-encoding on top of
  // generatePath's own encoding left `%20` in the path and broke file loading.
  it('encodes the file path exactly once', () => {
    const filePath = '/Users/someone/Documents/k6-studio/Recordings/a b - c.har'

    const viewPath = getViewPath(filePath)
    const param = viewPath.slice('/file/'.length)

    expect(decodeURIComponent(param)).toBe(filePath)
  })

  it('keeps path separators out of the route segment', () => {
    const viewPath = getViewPath('/tmp/dir/file.har')

    expect(viewPath.slice('/file/'.length)).not.toContain('/')
  })
})
