import { afterEach, describe, expect, it, vi } from 'vitest'

import * as path from './path'
import type * as PathModule from './path'

async function importPath(
  platform: 'win32' | 'linux'
): Promise<typeof PathModule> {
  vi.resetModules()
  vi.stubGlobal('window', { studio: { platform } })
  vi.stubGlobal('process', { ...process, platform })
  return import('./path')
}

describe('name', () => {
  it('returns filename without extension', () => {
    expect(path.name('/foo/bar/baz.txt')).toBe('baz')
  })

  it('returns filename for file with no extension', () => {
    expect(path.name('/foo/bar/baz')).toBe('baz')
  })

  it('returns filename for hidden file with no extension', () => {
    expect(path.name('/foo/.gitignore')).toBe('.gitignore')
  })

  it('returns filename without last extension for multiple dots', () => {
    expect(path.name('/foo/file.tar.gz')).toBe('file.tar')
  })
})

describe('toNativePath', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('joins segments with backslashes on windows', async () => {
    const path = await importPath('win32')
    expect(path.toNativePath('a/b/c')).toBe('a\\b\\c')
  })

  it('leaves forward slashes unchanged on non-windows', async () => {
    const path = await importPath('linux')
    expect(path.toNativePath('a/b/c')).toBe('a/b/c')
  })

  it('leaves a path without separators unchanged on windows', async () => {
    const path = await importPath('win32')
    expect(path.toNativePath('foo')).toBe('foo')
  })

  it('handles empty string on windows', async () => {
    const path = await importPath('win32')
    expect(path.toNativePath('')).toBe('')
  })
})
