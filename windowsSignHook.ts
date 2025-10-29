import { spawn } from 'node:child_process'

export default function (filePath: string) {
  console.log(`Path to file to sign: ${filePath}`)

  const signToolPath = process.env.SIGNTOOL_PATH
  if (!signToolPath) {
    throw new Error('SIGNTOOL_PATH environment variable is not set')
  }

  const trustedSigningAccount = process.env.TRUSTED_SIGNING_ACCOUNT
  if (!trustedSigningAccount) {
    throw new Error('TRUSTED_SIGNING_ACCOUNT environment variable is not set')
  }

  const trustedSigningProfile = process.env.TRUSTED_SIGNING_PROFILE
  if (!trustedSigningProfile) {
    throw new Error('TRUSTED_SIGNING_PROFILE environment variable is not set')
  }

  const trustedSigningEndpoint = process.env.TRUSTED_SIGNING_ENDPOINT
  if (!trustedSigningEndpoint) {
    throw new Error('TRUSTED_SIGNING_ENDPOINT environment variable is not set')
  }

  const args = [
    'code',
    'trusted-signing',
    filePath,
    '-td',
    'sha256',
    '-fd',
    'sha256',
    '--trusted-signing-account',
    trustedSigningAccount,
    '--trusted-signing-certificate-profile',
    trustedSigningProfile,
    '--trusted-signing-endpoint',
    trustedSigningEndpoint,
  ]

  const signingProc = spawn(signToolPath, args, {
    env: process.env,
    cwd: process.cwd(),
  })

  signingProc.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`)
  })

  signingProc.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`)
  })
}
