import path from 'path'
import invariant from 'tiny-invariant'
import {
  GENERATORS_PATH,
  RECORDINGS_PATH,
  SCRIPTS_PATH,
} from '../../constants/workspace'

export function getFilePathFromName(name: string) {
  invariant(process, 'Only use this function in the main process')

  switch (name.split('.').pop()) {
    case 'har':
      return path.join(RECORDINGS_PATH, name)

    case 'json':
      return path.join(GENERATORS_PATH, name)

    case 'js':
      return path.join(SCRIPTS_PATH, name)

    default:
      throw new Error('Invalid file type')
  }
}
