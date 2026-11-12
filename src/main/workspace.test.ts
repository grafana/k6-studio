import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import {
  deserializeGenerator,
  serializeGenerator,
} from '@/handlers/generator/serialization'
import { createGeneratorData } from '@/test/factories/generator'

import { updateReferences } from './workspace'

describe('updateReferences', () => {
  let directory: string

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'k6-studio-references-'))
  })

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true })
  })

  it('skips unsupported paths without reading them or counting failures', async () => {
    expect(
      await updateReferences('/old.har', '/new.har', [
        join(directory, 'missing.txt'),
      ])
    ).toEqual({ updated: 0, failed: 0 })
  })

  it('preserves a readable generator when updating a recording reference', async () => {
    const filePath = join(directory, 'test.k6g')
    const oldPath = join(directory, 'old.har')
    const newPath = join(directory, 'new.har')
    const generator = createGeneratorData({ recordingPath: oldPath })
    await writeFile(filePath, serializeGenerator(filePath, generator))

    expect(await updateReferences(oldPath, newPath, [filePath])).toEqual({
      updated: 1,
      failed: 0,
    })
    const contents = await readFile(filePath, 'utf-8')
    expect(JSON.parse(contents)).toMatchObject({ recordingPath: 'new.har' })
    expect(deserializeGenerator(filePath, contents)).toEqual({
      ...generator,
      recordingPath: newPath,
    })
  })

  it('updates data files and parameterization references while preserving other paths', async () => {
    const filePath = join(directory, 'test.k6g')
    const oldPath = join(directory, 'old.csv')
    const newPath = join(directory, 'new.csv')
    const otherPath = join(directory, 'other.csv')
    const generator = createGeneratorData({
      testData: {
        variables: [],
        files: [{ name: oldPath }, { name: otherPath }],
      },
      rules: [
        {
          id: 'parameterization',
          type: 'parameterization',
          enabled: true,
          filter: { path: '' },
          selector: { type: 'text', from: 'body', value: 'user' },
          value: {
            type: 'dataFileValue',
            fileName: oldPath,
            propertyName: 'user',
          },
        },
      ],
    })
    await writeFile(filePath, serializeGenerator(filePath, generator))

    await updateReferences(oldPath, newPath, [filePath])

    const updated = deserializeGenerator(
      filePath,
      await readFile(filePath, 'utf-8')
    )
    expect(updated.testData.files).toEqual([
      { name: newPath },
      { name: otherPath },
    ])
    expect(updated.rules[0]).toMatchObject({ value: { fileName: newPath } })
    expect(updated.recordingPath).toBe('')
  })

  it('counts failures and continues updating readable generators', async () => {
    const invalidPath = join(directory, 'invalid.k6g')
    const validPath = join(directory, 'valid.k6g')
    await writeFile(invalidPath, 'invalid JSON')
    await writeFile(
      validPath,
      serializeGenerator(validPath, createGeneratorData())
    )

    expect(
      await updateReferences('/old.har', '/new.har', [invalidPath, validPath])
    ).toEqual({
      updated: 1,
      failed: 1,
    })
    expect(await readFile(invalidPath, 'utf-8')).toBe('invalid JSON')
  })
})
