const { execSync } = require('child_process')
const { existsSync } = require('fs')

const K6_VERSION = 'v0.55.0'
const K6_PATH_MAC_AMD = `k6-${K6_VERSION}-macos-amd64`
const K6_PATH_MAC_ARM = `k6-${K6_VERSION}-macos-arm64`
const K6_PATH_WIN_AMD = `k6-${K6_VERSION}-windows-amd64`
const K6_PATH_LINUX_AMD = `k6-${K6_VERSION}-linux-amd64`
const K6_PATH_LINUX_ARM = `k6-${K6_VERSION}-linux-arm64`

const getMacOSK6Binary = () => {
  const command = `
# download binaries
curl -LO https://github.com/grafana/k6/releases/download/${K6_VERSION}/${K6_PATH_MAC_AMD}.zip
curl -LO https://github.com/grafana/k6/releases/download/${K6_VERSION}/${K6_PATH_MAC_ARM}.zip

# unzip & smoke test
unzip ${K6_PATH_MAC_AMD}.zip
unzip ${K6_PATH_MAC_ARM}.zip
${K6_PATH_MAC_AMD}/k6 version
${K6_PATH_MAC_ARM}/k6 version

# move to resource folder
mv ${K6_PATH_MAC_AMD}/k6 resources/mac/x86_64
mv ${K6_PATH_MAC_ARM}/k6 resources/mac/arm64

# cleanup
rm ${K6_PATH_MAC_AMD}.zip
rm ${K6_PATH_MAC_ARM}.zip
rmdir ${K6_PATH_MAC_AMD}
rmdir ${K6_PATH_MAC_ARM}
`

  execSync(command)
}

const getWindowsK6Binary = () => {
  const command = `
# download binaries
Invoke-WebRequest -Uri "https://github.com/grafana/k6/releases/download/${K6_VERSION}/${K6_PATH_WIN_AMD}.zip" -OutFile "k6-windows-amd64.zip"

# unzip & smoke test
Expand-Archive -Path "k6-windows-amd64.zip" -DestinationPath "."
${K6_PATH_WIN_AMD}\\k6.exe version

# move to resource folder
Move-Item -Path "${K6_PATH_WIN_AMD}\\k6.exe" -Destination resources\\win\\x86_64

# clean up
del k6-windows-amd64.zip
Remove-Item -Path "${K6_PATH_WIN_AMD}" -Recurse
`

  execSync(command, { shell: 'powershell.exe' })
}

const getLinuxK6Binary = () => {
  const arch = process.arch === 'arm64' ? 'arm64' : 'x86_64'
  const binaryName = arch === 'arm64' ? K6_PATH_LINUX_ARM : K6_PATH_LINUX_AMD

  const command = `
# download binaries
curl -LO https://github.com/grafana/k6/releases/download/${K6_VERSION}/${binaryName}.tar.gz

# unzip & smoke test
tar -zxf ${binaryName}.tar.gz
${binaryName}/k6 version

# move to resource folder
mv ${binaryName}/k6 resources/linux/${arch}

# cleanup
rm ${binaryName}.tar.gz
rmdir ${binaryName}
`

  execSync(command)
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
    const arch = process.arch === 'arm64' ? 'arm64' : 'x86_64'
    if (!existsSync(`resources/linux/${arch}/k6`)) {
      console.log('k6 binary not found')
      console.log('downloading k6... this might take some time...')
      getLinuxK6Binary()
      console.log('k6 binary download completed')
    }
    break
  default:
    console.log(`unsupported platform found: ${process.platform}`)
}
