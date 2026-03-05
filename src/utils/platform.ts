import { platform, arch } from 'os'

import { Arch, Platform } from '@/types/electron'

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
