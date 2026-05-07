import path from 'path'

import { DATA_FILES_PATH, RECORDINGS_PATH } from '@/constants/workspace'
import { GeneratorFileDataSchema } from '@/schemas/generator'
import { GeneratorFileData } from '@/types/generator'

export function deserializeGenerator(data: string): GeneratorFileData {
  const generator = GeneratorFileDataSchema.parse(JSON.parse(data))

  return {
    ...generator,
    recordingPath: generator.recordingPath
      ? path.join(RECORDINGS_PATH, generator.recordingPath)
      : generator.recordingPath,
    testData: {
      ...generator.testData,
      files: generator.testData.files.map((file) => ({
        ...file,
        name: path.join(DATA_FILES_PATH, file.name),
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
            fileName: path.join(DATA_FILES_PATH, rule.value.fileName),
          },
        }
      }

      return rule
    }),
  }
}

export function serializeGenerator(
  generator: GeneratorFileData
): GeneratorFileData {
  return {
    ...generator,
    recordingPath: generator.recordingPath
      ? path.basename(generator.recordingPath)
      : generator.recordingPath,
    testData: {
      ...generator.testData,
      files: generator.testData.files.map((file) => ({
        ...file,
        name: path.basename(file.name),
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
            fileName: path.basename(rule.value.fileName),
          },
        }
      }

      return rule
    }),
  }
}
