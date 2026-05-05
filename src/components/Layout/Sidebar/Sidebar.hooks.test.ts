import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { useStudioUIStore } from '@/store/ui'
import { StudioFile } from '@/types'

import { useFiles } from './Sidebar.hooks'

vi.mock('@/store/ui', () => ({ useStudioUIStore: vi.fn() }))

function makeFile(
  overrides: Partial<StudioFile> & Pick<StudioFile, 'type'>
): StudioFile {
  return {
    displayName: 'file',
    fileName: 'file.ext',
    path: '/tmp/file.ext',
    ...overrides,
  }
}

function toMap(files: StudioFile[]): Map<string, StudioFile> {
  return new Map(files.map((file) => [file.fileName, file]))
}

function mockStore({
  recordings = [],
  generators = [],
  browserTests = [],
  scripts = [],
  dataFiles = [],
}: {
  recordings?: StudioFile[]
  generators?: StudioFile[]
  browserTests?: StudioFile[]
  scripts?: StudioFile[]
  dataFiles?: StudioFile[]
}) {
  const state = {
    recordings: toMap(recordings),
    generators: toMap(generators),
    browserTests: toMap(browserTests),
    scripts: toMap(scripts),
    dataFiles: toMap(dataFiles),
  } as unknown as Parameters<Parameters<typeof useStudioUIStore>[0]>[0]
  vi.mocked(useStudioUIStore).mockImplementation((selector) => selector(state))
}

describe('useFiles', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns all files unfiltered when search term is empty', () => {
    mockStore({
      recordings: [makeFile({ type: 'recording', displayName: 'rec1' })],
      generators: [makeFile({ type: 'generator', displayName: 'gen1' })],
      browserTests: [makeFile({ type: 'browser-test', displayName: 'btest1' })],
      scripts: [makeFile({ type: 'script', displayName: 'script1' })],
      dataFiles: [makeFile({ type: 'data-file', displayName: 'data1' })],
    })

    const { result } = renderHook(() => useFiles(''))

    expect(result.current.recordings).toHaveLength(1)
    expect(result.current.tests).toHaveLength(2)
    expect(result.current.scripts).toHaveLength(1)
    expect(result.current.dataFiles).toHaveLength(1)
  })

  it('merges generators and browserTests into a single tests list sorted by displayName', () => {
    mockStore({
      generators: [
        makeFile({
          type: 'generator',
          displayName: 'b-gen',
          fileName: 'b.k6g',
        }),
        makeFile({
          type: 'generator',
          displayName: 'd-gen',
          fileName: 'd.k6g',
        }),
      ],
      browserTests: [
        makeFile({
          type: 'browser-test',
          displayName: 'a-bt',
          fileName: 'a.k6b',
        }),
        makeFile({
          type: 'browser-test',
          displayName: 'c-bt',
          fileName: 'c.k6b',
        }),
      ],
    })

    const { result } = renderHook(() => useFiles(''))

    expect(result.current.tests.map((file) => file.displayName)).toEqual([
      'a-bt',
      'b-gen',
      'c-bt',
      'd-gen',
    ])
  })

  it('exposes counts for each category', () => {
    mockStore({
      recordings: [
        makeFile({ type: 'recording', fileName: 'r1' }),
        makeFile({ type: 'recording', fileName: 'r2' }),
      ],
      generators: [makeFile({ type: 'generator', fileName: 'g1' })],
      browserTests: [makeFile({ type: 'browser-test', fileName: 'b1' })],
      scripts: [],
      dataFiles: [
        makeFile({ type: 'data-file', fileName: 'd1' }),
        makeFile({ type: 'data-file', fileName: 'd2' }),
        makeFile({ type: 'data-file', fileName: 'd3' }),
      ],
    })

    const { result } = renderHook(() => useFiles(''))

    expect(result.current.counts).toEqual({
      recordings: 2,
      tests: 2,
      scripts: 0,
      dataFiles: 3,
    })
  })

  it('filters via fuzzy search across all categories', () => {
    mockStore({
      recordings: [
        makeFile({
          type: 'recording',
          displayName: 'home-page',
          fileName: 'h.har',
        }),
        makeFile({
          type: 'recording',
          displayName: 'login-page',
          fileName: 'l.har',
        }),
      ],
      generators: [
        makeFile({
          type: 'generator',
          displayName: 'home-flow',
          fileName: 'hf.k6g',
        }),
      ],
    })

    const { result } = renderHook(() => useFiles('home'))

    expect(result.current.recordings).toHaveLength(1)
    expect(result.current.recordings[0]?.displayName).toBe('home-page')
    expect(result.current.tests).toHaveLength(1)
    expect(result.current.tests[0]?.displayName).toBe('home-flow')
  })

  it('returns counts based on unfiltered data even when search has matches', () => {
    mockStore({
      generators: [
        makeFile({
          type: 'generator',
          displayName: 'apple',
          fileName: 'a.k6g',
        }),
        makeFile({
          type: 'generator',
          displayName: 'banana',
          fileName: 'b.k6g',
        }),
      ],
      browserTests: [
        makeFile({
          type: 'browser-test',
          displayName: 'cherry',
          fileName: 'c.k6b',
        }),
      ],
    })

    const { result } = renderHook(() => useFiles('apple'))

    expect(result.current.tests).toHaveLength(1)
    expect(result.current.counts.tests).toBe(3)
  })
})
