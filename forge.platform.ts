/**
 * Host OS/arch for Electron Forge config only.
 * Do not import `electron` here — Forge loads `forge.config.ts` via ts-node in plain Node,
 * and importing `electron` during config evaluation breaks module loading on some Node versions.
 */
import { arch, platform } from 'node:os'

export type ForgeHostPlatform = 'linux' | 'mac' | 'win'
export type ForgeHostArch = 'arm64' | 'x86_64'

export function getForgeHostPlatform(): ForgeHostPlatform {
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

export function getForgeHostArch(): ForgeHostArch {
  switch (arch()) {
    case 'arm64':
      return 'arm64'
    case 'x64':
      return 'x86_64'
    default:
      throw new Error('unsupported arch')
  }
}
