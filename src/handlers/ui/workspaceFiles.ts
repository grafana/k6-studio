import { readdir } from 'fs/promises'
import path from 'path'

import {
  RECORDINGS_PATH,
  GENERATORS_PATH,
  SCRIPTS_PATH,
  TEMP_SCRIPT_SUFFIX,
  DATA_FILES_PATH,
  BROWSER_TESTS_PATH,
  VALIDATOR_RUNS_PATH,
} from '@/constants/workspace'
import type { GetFilesResponse } from '@/handlers/ui/types'
import { getStudioFileFromPath } from '@/main/file'
import type { StudioFile } from '@/types'

async function collectValidatorRunHarPaths(dir: string): Promise<string[]> {
  const paths: string[] = []
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isFile() && entry.name.endsWith('.har')) {
      paths.push(full)
    } else if (entry.isDirectory()) {
      paths.push(...(await collectValidatorRunHarPaths(full)))
    }
  }
  return paths
}

export async function loadWorkspaceFiles(): Promise<GetFilesResponse> {
  const recordings = (await readdir(RECORDINGS_PATH, { withFileTypes: true }))
    .filter((f) => f.isFile())
    .map((f) => getStudioFileFromPath(path.join(RECORDINGS_PATH, f.name)))
    .filter((f) => typeof f !== 'undefined')

  const generators = (await readdir(GENERATORS_PATH, { withFileTypes: true }))
    .filter((f) => f.isFile())
    .map((f) => getStudioFileFromPath(path.join(GENERATORS_PATH, f.name)))
    .filter((f) => typeof f !== 'undefined')

  const browserTests = (
    await readdir(BROWSER_TESTS_PATH, { withFileTypes: true })
  )
    .filter((f) => f.isFile())
    .map((f) => getStudioFileFromPath(path.join(BROWSER_TESTS_PATH, f.name)))
    .filter((f) => typeof f !== 'undefined')

  const scripts = (await readdir(SCRIPTS_PATH, { withFileTypes: true }))
    .filter((f) => f.isFile() && !f.name.endsWith(TEMP_SCRIPT_SUFFIX))
    .map((f) => getStudioFileFromPath(path.join(SCRIPTS_PATH, f.name)))
    .filter((f) => typeof f !== 'undefined')

  const dataFiles = (await readdir(DATA_FILES_PATH, { withFileTypes: true }))
    .filter((f) => f.isFile())
    .map((f) => getStudioFileFromPath(path.join(DATA_FILES_PATH, f.name)))
    .filter((f) => typeof f !== 'undefined')

  const validatorHarPaths = await collectValidatorRunHarPaths(
    VALIDATOR_RUNS_PATH
  )
  const validatorRuns = validatorHarPaths
    .map((p) => getStudioFileFromPath(p))
    .filter((f): f is StudioFile => f !== undefined)

  return {
    recordings,
    generators,
    browserTests,
    scripts,
    dataFiles,
    validatorRuns,
  }
}
