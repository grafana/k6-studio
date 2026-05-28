const { readFileSync, writeFileSync } = require('fs')
const { join } = require('path')

const EXPECTED_SUFFIXES = [
  'macos-amd64.zip',
  'macos-arm64.zip',
  'windows-amd64.zip',
  'linux-amd64.tar.gz',
  'linux-arm64.tar.gz',
]

const INSTALL_K6_PATH = join(__dirname, 'install-k6.js')

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

;(async () => {
  let version = process.argv[2]

  if (!version) {
    console.error('Usage: node update-k6-version.js <version>')
    console.error('Example: node update-k6-version.js v2.1.0')
    process.exit(1)
  }

  if (/^\d+\.\d+\.\d+$/.test(version)) {
    version = `v${version}`
    console.log(`Note: prepended "v" → ${version}`)
  }

  if (!/^v\d+\.\d+\.\d+$/.test(version)) {
    console.error(`Invalid version format: ${version}`)
    console.error('Expected format: v1.2.3')
    process.exit(1)
  }

  let content
  try {
    content = readFileSync(INSTALL_K6_PATH, 'utf-8')
  } catch {
    console.error(`Could not read install-k6.js at ${INSTALL_K6_PATH}`)
    process.exit(1)
  }

  const currentMatch = content.match(/const K6_VERSION = '([^']+)'/)
  const currentVersion = currentMatch?.[1]

  if (currentVersion === version) {
    console.log(`install-k6.js is already at ${version}`)
    process.exit(0)
  }

  const checksumsUrl = `https://github.com/grafana/k6/releases/download/${version}/k6-${version}-checksums.txt`
  console.log(`Fetching checksums from ${checksumsUrl}`)

  let response
  try {
    response = await fetch(checksumsUrl)
  } catch (err) {
    console.error(`Network error: ${err.message}`)
    process.exit(1)
  }

  if (response.status === 404) {
    console.error(
      `Version ${version} not found. Check: https://github.com/grafana/k6/releases/tag/${version}`
    )
    process.exit(1)
  }

  if (!response.ok) {
    console.error(`HTTP ${response.status} fetching checksums`)
    process.exit(1)
  }

  const body = await response.text()
  const checksumMap = new Map()
  for (const line of body.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue
    const parts = trimmed.split(/\s+/)
    if (parts.length === 2) {
      checksumMap.set(parts[1], parts[0])
    }
  }

  const newChecksums = {}
  const missing = []
  for (const suffix of EXPECTED_SUFFIXES) {
    const filename = `k6-${version}-${suffix}`
    const hash = checksumMap.get(filename)
    if (!hash) {
      missing.push(filename)
    } else {
      newChecksums[suffix] = hash
    }
  }

  if (missing.length > 0) {
    console.error('Missing checksums for:')
    for (const f of missing) console.error(`  ${f}`)
    process.exit(1)
  }

  content = content.replace(
    /const K6_VERSION = '[^']+'/,
    `const K6_VERSION = '${version}'`
  )

  for (const suffix of EXPECTED_SUFFIXES) {
    const pattern = new RegExp(
      `(\\[\`k6-\\$\\{K6_VERSION\\}-${escapeRegex(suffix)}\`\\]:\\s*\\n\\s*')([a-f0-9]{64})(')`
    )
    const match = content.match(pattern)
    if (!match) {
      console.error(`Could not find checksum slot for ${suffix} in install-k6.js`)
      process.exit(1)
    }
    content = content.replace(pattern, `$1${newChecksums[suffix]}$3`)
  }

  writeFileSync(INSTALL_K6_PATH, content, 'utf-8')

  console.log(`\nUpdated install-k6.js to k6 ${version}\n`)
  if (currentVersion) {
    console.log(`  K6_VERSION: ${currentVersion} → ${version}\n`)
  }
  console.log('  Checksums:')
  for (const suffix of EXPECTED_SUFFIXES) {
    const hash = newChecksums[suffix]
    const short = `${hash.slice(0, 8)}…${hash.slice(-8)}`
    console.log(`    ${suffix.padEnd(22)} ${short}`)
  }
  console.log('')
})()
