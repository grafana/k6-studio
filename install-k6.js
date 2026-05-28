const { execSync } = require('child_process')
const { createHash } = require('crypto')
const { existsSync, readFileSync } = require('fs')
const { join } = require('path')

// To update to a new k6 version, run: node update-k6-version.js <version>
const k6Versions = JSON.parse(
  readFileSync(join(__dirname, 'k6-versions.json'), 'utf-8')
)

const K6_VERSION = k6Versions.version

const ARCHIVE_EXTENSIONS = {
  'macos-amd64': '.zip',
  'macos-arm64': '.zip',
  'windows-amd64': '.zip',
  'linux-amd64': '.tar.gz',
  'linux-arm64': '.tar.gz',
}

const CHECKSUMS = Object.fromEntries(
  Object.entries(k6Versions.checksums).map(([platform, hash]) => [
    `k6-${K6_VERSION}-${platform}${ARCHIVE_EXTENSIONS[platform]}`,
    hash,
  ])
)

const K6_PATH_MAC_AMD = `k6-${K6_VERSION}-macos-amd64`
const K6_PATH_MAC_ARM = `k6-${K6_VERSION}-macos-arm64`
const K6_PATH_WIN_AMD = `k6-${K6_VERSION}-windows-amd64`
const K6_PATH_LINUX_AMD = `k6-${K6_VERSION}-linux-amd64`
const K6_PATH_LINUX_ARM = `k6-${K6_VERSION}-linux-arm64`

function verifyChecksum(filePath, archiveName) {
  const expected = CHECKSUMS[archiveName]
  if (!expected) {
    throw new Error(
      `No checksum found for ${archiveName}. Update the CHECKSUMS map.`
    )
  }
  const data = readFileSync(filePath)
  const actual = createHash('sha256').update(data).digest('hex')
  if (actual !== expected) {
    throw new Error(
      `Checksum mismatch for ${archiveName}!\n` +
        `  Expected: ${expected}\n` +
        `  Actual:   ${actual}`
    )
  }
  console.log(`checksum verified: ${archiveName}`)
}

const getMacOSK6Binary = () => {
  const amdArchive = `${K6_PATH_MAC_AMD}.zip`
  const armArchive = `${K6_PATH_MAC_ARM}.zip`

  execSync(
    `curl -fLO https://github.com/grafana/k6/releases/download/${K6_VERSION}/${amdArchive} && ` +
      `curl -fLO https://github.com/grafana/k6/releases/download/${K6_VERSION}/${armArchive}`
  )

  verifyChecksum(amdArchive, amdArchive)
  verifyChecksum(armArchive, armArchive)

  execSync(`unzip ${amdArchive} && unzip ${armArchive}`)

  // Smoke-test each binary separately — the cross-arch binary can't execute
  // (e.g. ARM binary on Intel Mac CI), so only the native arch is required.
  const nativeArch = process.arch === 'arm64' ? 'arm' : 'amd'
  const smokeTests = [
    { path: `${K6_PATH_MAC_AMD}/k6`, arch: 'amd' },
    { path: `${K6_PATH_MAC_ARM}/k6`, arch: 'arm' },
  ]
  for (const { path, arch } of smokeTests) {
    try {
      execSync(`${path} version`)
    } catch {
      if (arch === nativeArch)
        throw new Error(`Native binary failed smoke test: ${path}`)
      console.log(`skipping smoke test for non-native binary: ${path}`)
    }
  }

  execSync(
    `mv ${K6_PATH_MAC_AMD}/k6 resources/mac/x86_64 && ` +
      `mv ${K6_PATH_MAC_ARM}/k6 resources/mac/arm64 && ` +
      `rm ${amdArchive} ${armArchive} && ` +
      `rmdir ${K6_PATH_MAC_AMD} ${K6_PATH_MAC_ARM}`
  )
}

const getWindowsK6Binary = () => {
  const archiveName = `${K6_PATH_WIN_AMD}.zip`
  const localFile = 'k6-windows-amd64.zip'

  execSync(
    `Invoke-WebRequest -Uri "https://github.com/grafana/k6/releases/download/${K6_VERSION}/${archiveName}" -OutFile "${localFile}"`,
    { shell: 'powershell.exe' }
  )

  verifyChecksum(localFile, archiveName)

  execSync(
    `Expand-Archive -Path "${localFile}" -DestinationPath "." ; ` +
      `${K6_PATH_WIN_AMD}\\k6.exe version ; ` +
      `Move-Item -Path "${K6_PATH_WIN_AMD}\\k6.exe" -Destination resources\\win\\x86_64 ; ` +
      `del ${localFile} ; ` +
      `Remove-Item -Path "${K6_PATH_WIN_AMD}" -Recurse`,
    { shell: 'powershell.exe' }
  )
}

const getLinuxK6Binary = () => {
  const amdArchive = `${K6_PATH_LINUX_AMD}.tar.gz`
  const armArchive = `${K6_PATH_LINUX_ARM}.tar.gz`

  execSync(
    `curl -fLO https://github.com/grafana/k6/releases/download/${K6_VERSION}/${amdArchive} && ` +
      `curl -fLO https://github.com/grafana/k6/releases/download/${K6_VERSION}/${armArchive}`
  )

  verifyChecksum(amdArchive, amdArchive)
  verifyChecksum(armArchive, armArchive)

  execSync(
    `tar -zxf ${amdArchive} && ` +
      `tar -zxf ${armArchive} && ` +
      `${K6_PATH_LINUX_AMD}/k6 version && ` +
      `mv ${K6_PATH_LINUX_AMD}/k6 resources/linux/x86_64 && ` +
      `mv ${K6_PATH_LINUX_ARM}/k6 resources/linux/arm64 && ` +
      `rm ${amdArchive} ${armArchive} && ` +
      `rmdir ${K6_PATH_LINUX_AMD} ${K6_PATH_LINUX_ARM}`
  )
}

switch (process.platform) {
  case 'darwin':
    // we check only for one arch since we include both binaries
    if (!existsSync('resources/mac/arm64/k6')) {
      console.log('k6 binary not found')
      console.log('downloading k6... this might take some time...')
      getMacOSK6Binary()
      console.log('k6 binary download completed')
    }
    break
  case 'win32':
    if (!existsSync('resources/win/x86_64/k6.exe')) {
      console.log('k6 binary not found')
      console.log('downloading k6... this might take some time...')
      getWindowsK6Binary()
      console.log('k6 binary download completed')
    }
    break
  case 'linux':
    // we check only for one arch since we include both binaries
    if (!existsSync('resources/linux/x86_64/k6')) {
      console.log('k6 binary not found')
      console.log('downloading k6... this might take some time...')
      getLinuxK6Binary()
      console.log('k6 binary download completed')
    }
    break
  default:
    console.log(`unsupported platform found: ${process.platform}`)
}
