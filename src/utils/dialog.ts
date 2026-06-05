/* eslint-disable no-restricted-imports */
import {
  BrowserWindow,
  dialog,
  OpenDialogOptions,
  OpenDialogReturnValue,
  SaveDialogOptions,
  SaveDialogReturnValue,
} from 'electron'

import { normalize, toNativePath } from './path'

type ExtendedOpenDialogOptions = OpenDialogOptions & {
  useNativePaths?: boolean
}

export async function showOpenDialog(
  browserWindow: BrowserWindow,
  { useNativePaths = false, ...dialogOptions }: ExtendedOpenDialogOptions
): Promise<OpenDialogReturnValue> {
  const nativeOptions = {
    ...dialogOptions,
    ...(dialogOptions.defaultPath && {
      defaultPath: toNativePath(dialogOptions.defaultPath),
    }),
  }

  const result = await dialog.showOpenDialog(browserWindow, nativeOptions)

  if (useNativePaths) {
    return result
  }

  return {
    ...result,
    filePaths: result.filePaths.map(normalize),
  }
}

export async function showSaveDialog(
  browserWindow: BrowserWindow,
  options: SaveDialogOptions
): Promise<SaveDialogReturnValue> {
  const nativeOptions = {
    ...options,
    ...(options.defaultPath && {
      defaultPath: toNativePath(options.defaultPath),
    }),
  }

  const result = await dialog.showSaveDialog(browserWindow, nativeOptions)

  return {
    ...result,
    filePath: result.filePath ? normalize(result.filePath) : result.filePath,
  }
}
