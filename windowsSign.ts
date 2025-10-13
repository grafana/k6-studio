import type { WindowsSignOptions } from '@electron/packager'
import type { HASHES } from '@electron/windows-sign/dist/esm/types'

export const windowsSign: WindowsSignOptions = {
  ...(process.env.SIGNTOOL_PATH
    ? { signToolPath: process.env.SIGNTOOL_PATH }
    : {}),
  signWithParams: `/v /debug --trusted-signing-account ${process.env.TRUSTED_SIGNING_ACCOUNT} --trusted-signing-certificate-profile ${process.env.TRUSTED_SIGNING_PROFILE} --trusted-signing-endpoint ${process.env.TRUSTED_SIGNING_ENDPOINT}`,
  timestampServer: 'http://timestamp.acs.microsoft.com',
  hashes: ['sha256' as HASHES],
}
