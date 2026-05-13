import path from 'path'

import { GeneratorFileDataSchema } from '@/schemas/generator'
import { GeneratorFileData } from '@/types/generator'

// We use empty strings to represent missing paths, so these functions preserve the empty
// string when converting between absolute and relative paths.
function toAbsolute(basePath: string, relativePath: string) {
  return relativePath ? path.resolve(basePath, relativePath) : ''
}

function toRelative(basePath: string, absolutePath: string) {
  return absolutePath ? path.relative(basePath, absolutePath) : ''
}

export function deserializeGenerator(
  filePath: string,
  data: string
): GeneratorFileData {
  const generator = GeneratorFileDataSchema.parse(JSON.parse(data))
  const generatorDir = path.dirname(filePath)

  return {
    ...generator,
    recordingPath: toAbsolute(generatorDir, generator.recordingPath),
    testData: {
      ...generator.testData,
      files: generator.testData.files.map((file) => ({
        ...file,
        name: toAbsolute(generatorDir, file.name),
      })),
    },
    rules: generator.rules.map((rule) => {
      if (
        rule.type === 'parameterization' &&
        rule.value.type === 'dataFileValue'
      ) {
        return {
          ...rule,
          value: {
            ...rule.value,
            fileName: toAbsolute(generatorDir, rule.value.fileName),
          },
        }
      }

      return rule
    }),
  }
}

export function serializeGenerator(
  filePath: string,
  generator: GeneratorFileData
): GeneratorFileData {
  const generatorDir = path.dirname(filePath)

  return {
    ...generator,
    recordingPath: toRelative(generatorDir, generator.recordingPath),
    testData: {
      ...generator.testData,
      files: generator.testData.files.map((file) => ({
        ...file,
        name: toRelative(generatorDir, file.name),
      })),
    },
    rules: generator.rules.map((rule) => {
      if (
        rule.type === 'parameterization' &&
        rule.value.type === 'dataFileValue'
      ) {
        return {
          ...rule,
          value: {
            ...rule.value,
            fileName: toRelative(generatorDir, rule.value.fileName),
          },
        }
      }

      return rule
    }),
  }
}
