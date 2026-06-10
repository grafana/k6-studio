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

// path.key(generatorPath) → set of path.key(referencedFilePath)
const forwardIndex = new Map<string, Set<string>>()
// path.key(referencedFilePath) → set of path.key(generatorPath)
const reverseIndex = new Map<string, Set<string>>()

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

function indexEntry(generatorPath: string, newReferences: string[]) {
  const generatorKey = path.key(generatorPath)
  const oldReferences = forwardIndex.get(generatorKey) ?? []

  // Remove stale reverse-index entries
  for (const reference of oldReferences) {
    const referencers = reverseIndex.get(reference)

    if (referencers === undefined) {
      continue
    }

    referencers.delete(generatorKey)

    if (referencers.size === 0) {
      reverseIndex.delete(reference)
    }
  }

  if (newReferences.length === 0) {
    forwardIndex.delete(generatorKey)

    return
  }

  forwardIndex.set(generatorKey, new Set(newReferences.map(path.key)))

  for (const ref of newReferences) {
    const refKey = path.key(ref)
    let referencers = reverseIndex.get(refKey)

    if (referencers === undefined) {
      referencers = new Set()
      reverseIndex.set(refKey, referencers)
    }

    referencers.add(generatorKey)
  }
}

async function add(filePath: string) {
  if (path.extname(filePath) !== '.k6g') {
    return
  }

  try {
    const data = await readFile(filePath, 'utf-8')
    const refs = extractReferences(filePath, data)

    indexEntry(filePath, refs)
  } catch (err) {
    log.warn(`workspace: failed to index ${filePath}`, err)

    indexEntry(filePath, [])
  }
}

function remove(filePath: string) {
  indexEntry(filePath, [])
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
    references: [...(forwardIndex.get(fileKey) ?? [])],
    referencedBy: [...(reverseIndex.get(fileKey) ?? [])],
  }
}

export const workspaceIndex = {
  add,
  remove,
  build,
  get,
}
