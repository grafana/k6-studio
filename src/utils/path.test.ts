import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type * as PathModule from './path'

async function importPath(platform: string): Promise<typeof PathModule> {
  vi.resetModules()
  vi.stubGlobal('window', { ...window, studio: { platform } })
  return import('./path')
}

describe('path (posix)', () => {
  let path: typeof PathModule

  beforeEach(async () => {
    path = await importPath('linux')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sep is /', () => {
    expect(path.sep).toBe('/')
  })

  describe('join', () => {
    it('joins segments with /', () => {
      expect(path.join('a', 'b', 'c')).toBe('a/b/c')
    })

    it('preserves leading /', () => {
      expect(path.join('/a', 'b')).toBe('/a/b')
    })

    it('resolves ..', () => {
      expect(path.join('a', 'b', '..', 'c')).toBe('a/c')
    })

    it('collapses multiple separators', () => {
      expect(path.join('a//b', 'c')).toBe('a/b/c')
    })
  })

  describe('basename', () => {
    it('returns last segment', () => {
      expect(path.basename('/foo/bar/baz.txt')).toBe('baz.txt')
    })

    it('strips extension when provided', () => {
      expect(path.basename('/foo/bar/baz.txt', '.txt')).toBe('baz')
    })

    it('handles trailing slash', () => {
      expect(path.basename('/foo/bar/')).toBe('bar')
    })
  })

  describe('dirname', () => {
    it('returns parent directory', () => {
      expect(path.dirname('/foo/bar/baz.txt')).toBe('/foo/bar')
    })

    it('returns / for top-level file', () => {
      expect(path.dirname('/foo')).toBe('/')
    })

    it('returns . for relative single segment', () => {
      expect(path.dirname('foo')).toBe('.')
    })
  })

  describe('extname', () => {
    it('returns extension with dot', () => {
      expect(path.extname('file.txt')).toBe('.txt')
    })

    it('returns empty string for no extension', () => {
      expect(path.extname('file')).toBe('')
    })

    it('returns empty string for hidden file with no extension', () => {
      expect(path.extname('.gitignore')).toBe('')
    })

    it('returns last extension for multiple dots', () => {
      expect(path.extname('file.tar.gz')).toBe('.gz')
    })
  })

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

  describe('parse', () => {
    it('parses absolute path', () => {
      expect(path.parse('/home/user/file.txt')).toEqual({
        root: '/',
        dir: '/home/user',
        base: 'file.txt',
        ext: '.txt',
        name: 'file',
      })
    })

    it('parses relative path', () => {
      expect(path.parse('foo/bar.js')).toEqual({
        root: '',
        dir: 'foo',
        base: 'bar.js',
        ext: '.js',
        name: 'bar',
      })
    })
  })
})

describe('path (windows)', () => {
  let path: typeof PathModule

  beforeEach(async () => {
    path = await importPath('win32')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sep is \\', () => {
    expect(path.sep).toBe('\\')
  })

  describe('join', () => {
    it('joins segments with \\', () => {
      expect(path.join('a', 'b', 'c')).toBe('a\\b\\c')
    })

    it('preserves drive letter root', () => {
      expect(path.join('C:\\', 'foo', 'bar')).toBe('C:\\foo\\bar')
    })

    it('resolves ..', () => {
      expect(path.join('C:\\a', 'b', '..', 'c')).toBe('C:\\a\\c')
    })

    it('normalizes forward slashes to backslashes', () => {
      expect(path.join('a/b', 'c')).toBe('a\\b\\c')
    })
  })

  describe('basename', () => {
    it('returns last segment', () => {
      expect(path.basename('C:\\foo\\bar\\baz.txt')).toBe('baz.txt')
    })

    it('strips extension when provided', () => {
      expect(path.basename('C:\\foo\\baz.txt', '.txt')).toBe('baz')
    })

    it('handles forward-slash paths', () => {
      expect(path.basename('C:/foo/bar.txt')).toBe('bar.txt')
    })
  })

  describe('dirname', () => {
    it('returns parent directory', () => {
      expect(path.dirname('C:\\foo\\bar\\baz.txt')).toBe('C:\\foo\\bar')
    })

    it('returns drive root for top-level file', () => {
      expect(path.dirname('C:\\foo')).toBe('C:\\')
    })

    it('returns . for relative single segment', () => {
      expect(path.dirname('foo')).toBe('.')
    })
  })

  describe('extname', () => {
    it('returns extension with dot', () => {
      expect(path.extname('C:\\file.txt')).toBe('.txt')
    })

    it('returns empty string for no extension', () => {
      expect(path.extname('C:\\file')).toBe('')
    })
  })

  describe('parse', () => {
    it('parses absolute path with drive letter', () => {
      expect(path.parse('C:\\Users\\user\\file.txt')).toEqual({
        root: 'C:\\',
        dir: 'C:\\Users\\user',
        base: 'file.txt',
        ext: '.txt',
        name: 'file',
      })
    })

    it('parses UNC path', () => {
      const result = path.parse('\\\\server\\share\\file.txt')
      expect(result.root).toBe('\\\\server\\')
      expect(result.base).toBe('file.txt')
    })
  })
})
