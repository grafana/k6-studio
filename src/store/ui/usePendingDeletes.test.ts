import { beforeEach, describe, expect, it } from 'vitest'

import { usePendingDeletesStore } from './usePendingDeletes'

describe('usePendingDeletesStore', () => {
  beforeEach(() => {
    usePendingDeletesStore.setState({ paths: new Set() })
  })

  it('add puts a path into the set', () => {
    usePendingDeletesStore.getState().add('/workspace/foo.har')
    expect(
      usePendingDeletesStore.getState().paths.has('/workspace/foo.har')
    ).toBe(true)
  })

  it('add is idempotent', () => {
    usePendingDeletesStore.getState().add('/workspace/foo.har')
    usePendingDeletesStore.getState().add('/workspace/foo.har')
    expect(usePendingDeletesStore.getState().paths.size).toBe(1)
  })

  it('remove clears a path from the set', () => {
    usePendingDeletesStore.getState().add('/workspace/foo.har')
    usePendingDeletesStore.getState().remove('/workspace/foo.har')
    expect(
      usePendingDeletesStore.getState().paths.has('/workspace/foo.har')
    ).toBe(false)
  })

  it('remove on a missing path is a no-op', () => {
    expect(() =>
      usePendingDeletesStore.getState().remove('/workspace/missing.har')
    ).not.toThrow()
    expect(usePendingDeletesStore.getState().paths.size).toBe(0)
  })
})
