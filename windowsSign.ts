import type { WindowsSignOptions } from '@electron/packager'

export const windowsSign: WindowsSignOptions = {
  ...(process.env.SIGNTOOL_PATH
    ? { signToolPath: process.env.SIGNTOOL_PATH }
    : {}),
  // signWithParams: `code trusted-signing /v /debug -td sha256 -fd sha256 --trusted-signing-account ${process.env.TRUSTED_SIGNING_ACCOUNT} --trusted-signing-certificate-profile ${process.env.TRUSTED_SIGNING_PROFILE} --trusted-signing-endpoint ${process.env.TRUSTED_SIGNING_ENDPOINT}`,
  hookModulePath: __filename,
}

module.exports = function (filePath: string) {
  console.log(`Path to file to sign: ${filePath}`)
}
