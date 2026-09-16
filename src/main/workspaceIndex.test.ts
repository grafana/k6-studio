import log from 'electron-log/main'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { serializeGenerator } from '@/handlers/generator/serialization'
import { createGeneratorData } from '@/test/factories/generator'
import { readFile } from '@/utils/fs'

import { workspaceIndex } from './workspaceIndex'

vi.mock('@/utils/fs', async (importOriginal) => {
  const fs = await importOriginal<typeof import('@/utils/fs')>()
  return { ...fs, readFile: vi.fn(fs.readFile) }
})

const logInfo = vi.spyOn(log, 'info')
const logWarn = vi.spyOn(log, 'warn')

function recordingGenerator(filePath: string, recordingPath: string) {
  return serializeGenerator(filePath, createGeneratorData({ recordingPath }))
}

describe('workspaceIndex', () => {
  let directory: string

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'k6-studio-index-'))
    vi.clearAllMocks()
  })

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true })
  })

  it('reports malformed generators as failed while indexing valid files', async () => {
    const validPath = join(directory, 'valid.k6g')
    const recordingPath = join(directory, 'recording.har')
    await writeFile(validPath, recordingGenerator(validPath, recordingPath))
    await writeFile(join(directory, 'invalid.k6g'), 'invalid JSON')

    await workspaceIndex.build(directory)

    expect(logInfo).toHaveBeenCalledWith(
      'workspace: finished building index (succeeded: 1, failed: 1)'
    )
    expect(workspaceIndex.get(recordingPath).referencedBy).toEqual([validPath])
  })

  it('removes references to generators deleted between builds', async () => {
    const deletedPath = join(directory, 'deleted.k6g')
    const keptPath = join(directory, 'kept.k6g')
    const recordingPath = join(directory, 'recording.har')
    await writeFile(deletedPath, recordingGenerator(deletedPath, recordingPath))
    await writeFile(keptPath, recordingGenerator(keptPath, recordingPath))
    await workspaceIndex.build(directory)
    expect(workspaceIndex.get(deletedPath).references).toEqual([recordingPath])

    await rm(deletedPath)
    await workspaceIndex.build(directory)

    expect(workspaceIndex.get(deletedPath).references).toEqual([])
    expect(workspaceIndex.get(recordingPath).referencedBy).toEqual([keptPath])
    expect(workspaceIndex.get(keptPath).references).toEqual([recordingPath])
  })

  it('ignores pending reads from a previous build after rebuilding', async () => {
    const filePath = join(directory, 'deleted.k6g')
    const recordingPath = join(directory, 'recording.har')
    const data = recordingGenerator(filePath, recordingPath)
    await writeFile(filePath, data)
    const read = Promise.withResolvers<string>()
    const started = Promise.withResolvers<void>()
    vi.mocked(readFile).mockImplementationOnce(() => {
      started.resolve()
      return read.promise
    })
    const previousBuild = workspaceIndex.build(directory)
    await started.promise

    await rm(filePath)
    await workspaceIndex.build(directory)
    read.resolve(data)
    await previousBuild

    expect(workspaceIndex.get(filePath).references).toEqual([])
    expect(workspaceIndex.get(recordingPath).referencedBy).toEqual([])
  })

  it('removes stale reverse references when a generator changes or is deleted', async () => {
    const filePath = join(directory, 'test.k6g')
    const oldPath = join(directory, 'old.har')
    const newPath = join(directory, 'new.har')
    await writeFile(filePath, recordingGenerator(filePath, oldPath))
    await workspaceIndex.add(filePath)
    await writeFile(filePath, recordingGenerator(filePath, newPath))

    await workspaceIndex.add(filePath)

    expect(workspaceIndex.get(oldPath).referencedBy).toEqual([])
    expect(workspaceIndex.get(newPath).referencedBy).toEqual([filePath])
    workspaceIndex.remove(filePath)
    expect(workspaceIndex.get(newPath).referencedBy).toEqual([])
    expect(workspaceIndex.get(filePath).references).toEqual([])
  })

  it('handles unreadable files without rejecting watcher updates', async () => {
    const filePath = join(directory, 'test.k6g')
    const recordingPath = join(directory, 'recording.har')
    await writeFile(filePath, recordingGenerator(filePath, recordingPath))
    await workspaceIndex.add(filePath)
    await rm(filePath)

    await expect(workspaceIndex.add(filePath)).resolves.toBe(false)

    expect(workspaceIndex.get(recordingPath).referencedBy).toEqual([])
    expect(logWarn).toHaveBeenCalled()
  })

  it('excludes node_modules from initial indexing', async () => {
    const excluded = join(directory, 'node_modules')
    await mkdir(excluded)
    await writeFile(join(excluded, 'invalid.k6g'), 'invalid JSON')

    await workspaceIndex.build(directory)

    expect(logWarn).not.toHaveBeenCalled()
    expect(logInfo).toHaveBeenCalledWith(
      'workspace: finished building index (succeeded: 0, failed: 0)'
    )
  })

  it('does not restore a deleted generator when its pending read finishes', async () => {
    const filePath = join(directory, 'deleted.k6g')
    const recordingPath = join(directory, 'recording.har')
    const read = Promise.withResolvers<string>()
    vi.mocked(readFile).mockReturnValueOnce(read.promise)

    const adding = workspaceIndex.add(filePath)
    workspaceIndex.remove(filePath)
    read.resolve(recordingGenerator(filePath, recordingPath))
    await adding

    expect(workspaceIndex.get(filePath).references).toEqual([])
    expect(workspaceIndex.get(recordingPath).referencedBy).toEqual([])
  })

  it('keeps newer references when concurrent reads finish out of order', async () => {
    const filePath = join(directory, 'updated.k6g')
    const oldPath = join(directory, 'old.har')
    const newPath = join(directory, 'new.har')
    const read = Promise.withResolvers<string>()
    vi.mocked(readFile).mockReturnValueOnce(read.promise)
    const adding = workspaceIndex.add(filePath)
    await writeFile(filePath, recordingGenerator(filePath, newPath))

    await workspaceIndex.add(filePath)
    read.resolve(recordingGenerator(filePath, oldPath))
    await adding

    expect(workspaceIndex.get(filePath).references).toEqual([newPath])
    expect(workspaceIndex.get(oldPath).referencedBy).toEqual([])
  })

  it('keeps newer references when an older read fails', async () => {
    const filePath = join(directory, 'updated.k6g')
    const recordingPath = join(directory, 'recording.har')
    const read = Promise.withResolvers<string>()
    vi.mocked(readFile).mockReturnValueOnce(read.promise)
    const adding = workspaceIndex.add(filePath)
    await writeFile(filePath, recordingGenerator(filePath, recordingPath))

    await workspaceIndex.add(filePath)
    read.reject(new Error('File disappeared during an earlier read'))
    await adding

    expect(workspaceIndex.get(filePath).references).toEqual([recordingPath])
    expect(workspaceIndex.get(recordingPath).referencedBy).toEqual([filePath])
  })
})
