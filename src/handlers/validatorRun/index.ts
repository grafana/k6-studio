import { ipcMain } from 'electron'
import { readFile } from 'fs/promises'
import path from 'path'

import { INVALID_FILENAME_CHARS } from '@/constants/files'
import { VALIDATOR_RUNS_PATH } from '@/constants/workspace'
import { Recording, RecordingSchema } from '@/schemas/recording'
import { createValidatorRunHarFile } from '@/utils/fileSystem'

import { ValidatorRunHandler } from './types'

function sanitizeSourceLabel(label: string) {
  const trimmed = label.replace(INVALID_FILENAME_CHARS, '_').trim()
  return trimmed.slice(0, 120) || 'Validator run'
}

export function initialize() {
  ipcMain.handle(
    ValidatorRunHandler.SaveSession,
    async (
      _,
      data: Recording,
      runSourceLabel: string,
      startedAtMs: number
    ) => {
      console.info(`${ValidatorRunHandler.SaveSession} event received`)

      const parsed = RecordingSchema.parse(data)

      if (!parsed.log.entries?.length) {
        return undefined
      }

      const startedAt =
        Number.isFinite(startedAtMs) && startedAtMs > 0
          ? new Date(startedAtMs)
          : new Date()

      return createValidatorRunHarFile({
        rootDirectory: VALIDATOR_RUNS_PATH,
        startedAt,
        sourceLabel: sanitizeSourceLabel(runSourceLabel),
        data: JSON.stringify(parsed, null, 2),
      })
    }
  )

  ipcMain.handle(
    ValidatorRunHandler.OpenFile,
    async (_, fileName: string): Promise<Recording> => {
      console.info(`${ValidatorRunHandler.OpenFile} event received`)

      const data = await readFile(path.join(VALIDATOR_RUNS_PATH, fileName), {
        encoding: 'utf-8',
        flag: 'r',
      })

      return RecordingSchema.parse(JSON.parse(data))
    }
  )
}
