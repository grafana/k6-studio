import { AddToastPayload } from '@/types/toast'
import { platform, arch } from 'os'
import { WebContents } from 'electron'
import path from 'path'
import invariant from 'tiny-invariant'
import {
  GENERATORS_PATH,
  RECORDINGS_PATH,
  SCRIPTS_PATH,
} from '../constants/workspace'

type Platform = 'linux' | 'mac' | 'win'
type Arch = 'arm64' | 'x86_64'

export function getPlatform(): Platform {
  switch (platform()) {
    case 'aix':
    case 'freebsd':
    case 'linux':
    case 'openbsd':
    case 'android':
      return 'linux'
    case 'darwin':
    case 'sunos':
      return 'mac'
    case 'win32':
      return 'win'
    default:
      throw new Error('unsupported platform')
  }
}

// note: the os.arch() returns the architecture for which the node runtime got compiled for, this could
// be wrong for our use case since we want to fish binaries for specific architectures we are building for.
// TODO: validate behaviour
export function getArch(): Arch {
  switch (arch()) {
    case 'arm64':
      return 'arm64'
    case 'x64':
      return 'x86_64'
    default:
      throw new Error('unsupported arch')
  }
}

/**
 * Show a toast in React
 */
export function sendToast(webContents: WebContents, toast: AddToastPayload) {
  webContents.send('ui:toast', toast)
}

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
