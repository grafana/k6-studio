const { execSync } = require('child_process')
const { createHash } = require('crypto')
const { existsSync, readFileSync } = require('fs')

const K6_VERSION = 'v1.2.1'
const K6_PATH_MAC_AMD = `k6-${K6_VERSION}-macos-amd64`
const K6_PATH_MAC_ARM = `k6-${K6_VERSION}-macos-arm64`
const K6_PATH_WIN_AMD = `k6-${K6_VERSION}-windows-amd64`
const K6_PATH_LINUX_AMD = `k6-${K6_VERSION}-linux-amd64`
const K6_PATH_LINUX_ARM = `k6-${K6_VERSION}-linux-arm64`

// To update checksums for a new k6 version:
// 1. Update K6_VERSION above
// 2. Download the checksums file:
//    curl -L https://github.com/grafana/k6/releases/download/<version>/k6-<version>-checksums.txt
// 3. Replace the hashes below with the values from that file
const CHECKSUMS = {
  [`k6-${K6_VERSION}-macos-amd64.zip`]:
    '9d5018eed8a142e2d64374faf9a79a45b7bddb33e19a00ec14b45d619dc84ceb',
  [`k6-${K6_VERSION}-macos-arm64.zip`]:
    'c5b55d160476f75e5b39f0a14871e217dd3a0cdb5419819be12a09038445f562',
  [`k6-${K6_VERSION}-windows-amd64.zip`]:
    '7464f71615c839069de54cbbb3e0aa67c5fbdf426802360bd3dd837a089a0c3a',
  [`k6-${K6_VERSION}-linux-amd64.tar.gz`]:
    'b082f79deef18bdbb4c7b8ab997d048553d8905bc35e9903ab9f2d7e3563993d',
  [`k6-${K6_VERSION}-linux-arm64.tar.gz`]:
    '4db0f1a277f2fdc48dff6ca8136f213da19d1134dae0e0eb850e61695be24645',
}

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

  execSync(
    `unzip ${amdArchive} && ` +
      `unzip ${armArchive} && ` +
      `${K6_PATH_MAC_AMD}/k6 version && ` +
      `${K6_PATH_MAC_ARM}/k6 version && ` +
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
