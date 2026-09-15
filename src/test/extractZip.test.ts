// @vitest-environment node
import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

type ExtractArchive = (archive: string, destination: string) => Promise<void>

// Resolve from each consumer so the tests cover its real dependency and import path.
const require = createRequire(import.meta.url)
const { extractElectronZip } = require(
  join(dirname(require.resolve('@electron/packager')), 'unzip.js')
) as { extractElectronZip: ExtractArchive }
const { unpackArchive } = require(
  join(dirname(require.resolve('@puppeteer/browsers')), 'fileUtil.js')
) as { unpackArchive: ExtractArchive }
const fixtures = fileURLToPath(new URL('./fixtures/zip/', import.meta.url))

describe.each([
  ['Electron Packager', extractElectronZip],
  ['Puppeteer', unpackArchive],
] as const)('%s ZIP extraction', (_name, extract) => {
  let root: string
  let destination: string
  let sentinel: string

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'k6-studio-zip-'))
    destination = join(root, 'extracted')
    sentinel = join(root, 'sentinel')
    await writeFile(sentinel, 'unchanged')
  })

  afterEach(async () => {
    await rm(root, { recursive: true, force: true })
  })

  it('rejects a symlink targeting a file outside the extraction directory', async () => {
    await expect(
      extract(join(fixtures, 'symlink-target.zip'), destination)
    ).rejects.toThrow()
    await expect(readFile(sentinel, 'utf8')).resolves.toBe('unchanged')
  })

  it('prevents duplicate symlink and file entries from overwriting an outside file', async () => {
    await extract(join(fixtures, 'duplicate-entry.zip'), destination)

    await expect(readFile(sentinel, 'utf8')).resolves.toBe('unchanged')
    await expect(readFile(join(destination, 'escape'), 'utf8')).resolves.toBe(
      'OVERWRITE'
    )
  })

  it('extracts regular files and preserves valid framework links and executable permissions', async () => {
    await extract(join(fixtures, 'valid-framework.zip'), destination)

    const executable = join(destination, 'F.framework/Versions/A/bin')
    await expect(readFile(executable, 'utf8')).resolves.toBe('ok')
    // Windows can lack symlink privileges and does not preserve POSIX mode bits.
    if (process.platform === 'win32') return

    await expect(
      readFile(join(destination, 'F.framework/bin'), 'utf8')
    ).resolves.toBe('ok')
    expect((await stat(executable)).mode & 0o777).toBe(0o755)
  })
})
