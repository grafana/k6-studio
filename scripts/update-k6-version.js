const { readFileSync, writeFileSync } = require('fs')
const { join } = require('path')

const EXPECTED_SUFFIXES = [
  'macos-amd64.zip',
  'macos-arm64.zip',
  'windows-amd64.zip',
  'linux-amd64.tar.gz',
  'linux-arm64.tar.gz',
]

const K6_VERSIONS_PATH = join(__dirname, '..', 'k6-versions.json')

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

  let k6Versions
  try {
    k6Versions = JSON.parse(readFileSync(K6_VERSIONS_PATH, 'utf-8'))
  } catch {
    console.error(`Could not read k6-versions.json at ${K6_VERSIONS_PATH}`)
    process.exit(1)
  }

  if (k6Versions.version === version) {
    console.log(`k6-versions.json is already at ${version}`)
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
      const platform = suffix.replace(/\.(zip|tar\.gz)$/, '')
      newChecksums[platform] = hash
    }
  }

  if (missing.length > 0) {
    console.error('Missing checksums for:')
    for (const f of missing) console.error(`  ${f}`)
    process.exit(1)
  }

  const currentVersion = k6Versions.version

  k6Versions.version = version
  k6Versions.checksums = newChecksums

  writeFileSync(
    K6_VERSIONS_PATH,
    JSON.stringify(k6Versions, null, 2) + '\n',
    'utf-8'
  )

  console.log(`\nUpdated k6-versions.json to k6 ${version}\n`)
  if (currentVersion) {
    console.log(`  version: ${currentVersion} → ${version}\n`)
  }
  console.log('  Checksums:')
  for (const suffix of EXPECTED_SUFFIXES) {
    const platform = suffix.replace(/\.(zip|tar\.gz)$/, '')
    const hash = newChecksums[platform]
    const short = `${hash.slice(0, 8)}…${hash.slice(-8)}`
    console.log(`    ${platform.padEnd(16)} ${short}`)
  }
  console.log('')
})()
