import type { WindowsSignOptions } from '@electron/packager'
import path from 'path'

export const windowsSign: WindowsSignOptions = {
  ...(process.env.SIGNTOOL_PATH
    ? { signToolPath: process.env.SIGNTOOL_PATH }
    : {}),
  hookModulePath: path.join(__dirname, 'windowsSignHook.ts'),
}
