import { spawn } from 'node:child_process'

module.exports = function (filePath: string) {
  console.log(`Path to file to sign: ${filePath}`)

  const signToolPath = process.env.SIGNTOOL_PATH
  if (!signToolPath) {
    throw new Error('SIGNTOOL_PATH environment variable is not set');
  }

  const args = [
    'code',
    'trusted-signing',
    '/v',
    '/debug',
    '-td', 'sha256',
    '-fd', 'sha256',
    '--trusted-signing-account', process.env.TRUSTED_SIGNING_ACCOUNT!,
    '--trusted-signing-certificate-profile', process.env.TRUSTED_SIGNING_PROFILE!,
    '--trusted-signing-endpoint', process.env.TRUSTED_SIGNING_ENDPOINT!
  ]

  const signingProc = spawn(signToolPath, args)

  signingProc.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  signingProc.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });
}
