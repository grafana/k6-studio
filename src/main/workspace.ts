import log from 'electron-log/main'

import {
  deserializeGenerator,
  serializeGenerator,
} from '@/handlers/generator/serialization'
import { readFile, writeFile } from '@/utils/fs'
import * as path from '@/utils/path'

import { getStudioFileFromPath } from './file'

function updateGeneratorReferences(
  data: string,
  filePath: string,
  oldPath: string,
  newPath: string
) {
  const generator = deserializeGenerator(filePath, data)

  const updated = {
    ...generator,
    recordingPath: path.equal(generator.recordingPath, oldPath)
      ? newPath
      : generator.recordingPath,
    testData: {
      ...generator.testData,
      files: generator.testData.files.map((file) => ({
        ...file,
        name: path.equal(file.name, oldPath) ? newPath : file.name,
      })),
    },
    rules: generator.rules.map((rule) => {
      if (
        rule.type === 'parameterization' &&
        rule.value.type === 'dataFileValue' &&
        path.equal(rule.value.fileName, oldPath)
      ) {
        return { ...rule, value: { ...rule.value, fileName: newPath } }
      }
      return rule
    }),
  }

  return JSON.stringify(serializeGenerator(filePath, updated))
}

function updateReferencesInFile(
  data: string,
  filePath: string,
  oldPath: string,
  newPath: string
) {
  switch (getStudioFileFromPath(filePath)?.type) {
    case 'generator':
      return updateGeneratorReferences(data, filePath, oldPath, newPath)

    default:
      return null
  }
}

export async function updateReferences(
  oldPath: string,
  newPath: string,
  referencingFiles: string[]
): Promise<{ updated: number; failed: number }> {
  let updated = 0
  let failed = 0

  for (const filePath of referencingFiles) {
    const file = getStudioFileFromPath(filePath)

    if (file === null) {
      continue
    }

    try {
      const data = await readFile(filePath, 'utf-8')
      const result = updateReferencesInFile(data, filePath, oldPath, newPath)

      if (result === null) {
        continue
      }

      await writeFile(filePath, result)

      updated++
    } catch (err) {
      log.error(`Failed to update reference in file ${filePath}:`, err)

      failed++
    }
  }

  return { updated, failed }
}
