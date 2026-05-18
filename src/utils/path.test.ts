import { describe, expect, it } from 'vitest'

import * as path from './path'

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
  it('joins segments with the OS native separator', () => {
    expect(path.toNativePath('a/b/c')).toBe(
      ['a', 'b', 'c'].join(path.native.sep)
    )
  })

  it('leaves a path without separators unchanged', () => {
    expect(path.toNativePath('foo')).toBe('foo')
  })

  it('handles empty string', () => {
    expect(path.toNativePath('')).toBe('')
  })
})
