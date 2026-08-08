import log from 'electron-log/main'
import pm from 'picomatch'
import { EntryInfo, readdirp } from 'readdirp'

import { deserializeGenerator } from '@/handlers/generator/serialization'
import { readFile } from '@/utils/fs'
import * as path from '@/utils/path'

const INDEXED_EXTENSIONS = new Set([
  '.har',
  '.k6g',
  '.k6b',
  '.csv',
  '.json',
  '.js',
  '.ts',
])

// Type aliases to make the code easier to understand.
type ReferencingFile = string
type ReferencedFile = string
type OriginalPath = string

// Using `path.key` normalizes the path to make comparisons easier across platforms, but we
// still want to get the original path in order to e.g. display it to the user. To get the
// origina path back we use a nested Map where the inner map is keyed by `path.key` and the
// value is the original path. We then do two lookups using normalized paths.

// A forward index that answers "which files is this file referencing?" If 'a' is referencing
// 'b' and 'c' then the index for 'a' contains 'b' and 'c'.
const referencesIndex = new Map<
  ReferencingFile,
  Map<ReferencedFile, OriginalPath>
>()

// A reverse index that answers "which files are referencing this file?" If 'a' is referencing
// 'b' and 'c' then the index for 'b' and 'c' contains 'a'.
const referencedByIndex = new Map<
  ReferencedFile,
  Map<ReferencingFile, OriginalPath>
>()

function extractReferences(generatorPath: string, data: string): string[] {
  const generator = deserializeGenerator(generatorPath, data)
  const references: string[] = []

  if (generator.recordingPath) {
    references.push(generator.recordingPath)
  }

  for (const file of generator.testData.files) {
    if (file.name) {
      references.push(file.name)
    }
  }

  for (const rule of generator.rules) {
    if (
      rule.type === 'parameterization' &&
      rule.value.type === 'dataFileValue' &&
      rule.value.fileName
    ) {
      references.push(rule.value.fileName)
    }
  }

  return references
}

function addToIndex(
  indexFilePath: OriginalPath,
  newReferences: OriginalPath[]
) {
  const indexedFileKey = path.key(indexFilePath)
  const oldReferences = referencesIndex.get(indexedFileKey)

  // First we make sure to remove all the old references in the reverse index, so if
  // 'a' was is by 'b' and 'c' and 'b' is removed then the reverse index for 'a'
  // only contains 'c'.
  for (const refKey of oldReferences?.keys() ?? []) {
    const referencers = referencedByIndex.get(refKey)

    if (referencers === undefined) {
      continue
    }

    referencers.delete(indexedFileKey)

    // If the file is no longer referenced by any file, remove it to avoid memory leaks.
    if (referencers.size === 0) {
      referencedByIndex.delete(refKey)
    }
  }

  // If the file is no longer referencing any files, remove it to avoid memory leaks.
  if (newReferences.length === 0) {
    referencesIndex.delete(indexedFileKey)

    return
  }

  // Index the new references for the file in the forward index. The original path is keyed
  // by the normalized path.
  referencesIndex.set(
    indexedFileKey,
    new Map(newReferences.map((ref) => [path.key(ref), ref]))
  )

  // Next we add the new references to the reverse index so that if 'a' is now referencing
  // 'b' and 'c' then the reverse index for 'b' and 'c' contains 'a'.
  for (const newRefKey of newReferences.map(path.key)) {
    let referencers = referencedByIndex.get(newRefKey)

    if (referencers === undefined) {
      referencers = new Map<string, string>()
      referencedByIndex.set(newRefKey, referencers)
    }

    // The original indexed path is keyed by the normalized path
    referencers.set(indexedFileKey, indexFilePath)
  }
}

async function add(filePath: string) {
  if (path.extname(filePath) !== '.k6g') {
    return
  }

  try {
    const data = await readFile(filePath, 'utf-8')
    const refs = extractReferences(filePath, data)

    addToIndex(filePath, refs)
  } catch (err) {
    log.warn(`workspace: failed to index ${filePath}`, err)

    addToIndex(filePath, [])
  }
}

function remove(filePath: string) {
  addToIndex(filePath, [])
}

async function build(
  workspaceRoot: string,
  excludedDirs: string[] = ['node_modules']
) {
  const isExcluded = pm(excludedDirs)

  try {
    const entries = readdirp(workspaceRoot, {
      fileFilter: (entry) =>
        INDEXED_EXTENSIONS.has(path.extname(entry.basename)),
      directoryFilter: (entry) => !isExcluded(entry.basename),
    }) as AsyncIterable<EntryInfo>

    const processing: Promise<void>[] = []

    for await (const entry of entries) {
      const filePath = path.normalize(entry.fullPath)

      processing.push(add(filePath))
    }

    const results = await Promise.allSettled(processing)

    const succeeded = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    log.info(
      `workspace: finished building index (succeeded: ${succeeded}, failed: ${failed})`
    )
  } catch (err) {
    log.error('workspace: failed to build index', err)
  }
}

function get(filePath: string): {
  references: string[]
  referencedBy: string[]
} {
  const fileKey = path.key(filePath)
  return {
    references: Array.from(referencesIndex.get(fileKey)?.values() ?? []),
    referencedBy: Array.from(referencedByIndex.get(fileKey)?.values() ?? []),
  }
}

export const workspaceIndex = {
  add,
  remove,
  build,
  get,
}
