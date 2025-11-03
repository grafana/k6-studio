import { spawn } from 'node:child_process'

export function spawnSignFile(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`Path to file to sign: ${filePath}`)

    const signToolPath = process.env.SIGNTOOL_PATH
    if (!signToolPath) {
      return reject(new Error('SIGNTOOL_PATH environment variable is not set'))
    }

    const trustedSigningAccount = process.env.TRUSTED_SIGNING_ACCOUNT
    if (!trustedSigningAccount) {
      return reject(
        new Error('TRUSTED_SIGNING_ACCOUNT environment variable is not set')
      )
    }

    const trustedSigningProfile = process.env.TRUSTED_SIGNING_PROFILE
    if (!trustedSigningProfile) {
      return reject(
        new Error('TRUSTED_SIGNING_PROFILE environment variable is not set')
      )
    }

    const trustedSigningEndpoint = process.env.TRUSTED_SIGNING_ENDPOINT
    if (!trustedSigningEndpoint) {
      return reject(
        new Error('TRUSTED_SIGNING_ENDPOINT environment variable is not set')
      )
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
      stdio: 'inherit',
    })

    signingProc.on('close', (code) => {
      if (code === 0) {
        console.log('Signing process completed successfully')
        resolve()
      } else {
        reject(new Error(`Signing process exited with code ${code}`))
      }
    })

    signingProc.on('error', (error) => {
      reject(new Error(`Failed to spawn signing process: ${error.message}`))
    })
  })
}
