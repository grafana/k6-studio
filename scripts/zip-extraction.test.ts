// @vitest-environment node
import { mkdtemp, readFile, readlink, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

type ExtractArchive = (archive: string, destination: string) => Promise<void>

const require = createRequire(import.meta.url)
const { extractElectronZip } = require(
  join(dirname(require.resolve('@electron/packager')), 'unzip.js')
) as { extractElectronZip: ExtractArchive }
const { unpackArchive } = require(
  join(dirname(require.resolve('@puppeteer/browsers')), 'fileUtil.js')
) as { unpackArchive: ExtractArchive }

const normalZip =
  'UEsDBBQAAAAAAG9nbF3FIFbnDwAAAA8AAAAIAAAAZmlsZS50eHRicm93c2VyIHBheWxvYWRQSwECFAMUAAAAAABvZ2xdxSBW5w8AAAAPAAAACAAAAAAAAAAAAAAAgAEAAAAAZmlsZS50eHRQSwUGAAAAAAEAAQA2AAAANQAAAAAA'

// These ZIPs contain file.txt and a Unix symlink, targeting file.txt or ../outside.txt.
const validZip =
  'UEsDBBQAAAAAAOpmbF3FIFbnDwAAAA8AAAAIAAAAZmlsZS50eHRicm93c2VyIHBheWxvYWRQSwMEFAAAAAAAAAAhACUW9+AIAAAACAAAAAQAAABsaW5rZmlsZS50eHRQSwECFAMUAAAAAADqZmxdxSBW5w8AAAAPAAAACAAAAAAAAAAAAAAAgAEAAAAAZmlsZS50eHRQSwECFAMUAAAAAAAAACEAJRb34AgAAAAIAAAABAAAAAAAAAAAAAAA/6E1AAAAbGlua1BLBQYAAAAAAgACAGgAAABfAAAAAAA='
const traversalZip =
  'UEsDBBQAAAAAAOpmbF3FIFbnDwAAAA8AAAAIAAAAZmlsZS50eHRicm93c2VyIHBheWxvYWRQSwMEFAAAAAAAAAAhAMadp9cOAAAADgAAAAQAAABsaW5rLi4vb3V0c2lkZS50eHRQSwECFAMUAAAAAADqZmxdxSBW5w8AAAAPAAAACAAAAAAAAAAAAAAAgAEAAAAAZmlsZS50eHRQSwECFAMUAAAAAAAAACEAxp2n1w4AAAAOAAAABAAAAAAAAAAAAAAA/6E1AAAAbGlua1BLBQYAAAAAAgACAGgAAABlAAAAAAA='

let directory: string

beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), 'studio-zip-'))
})

afterEach(async () => {
  await rm(directory, { recursive: true, force: true })
})

describe.each([
  { name: 'Electron Packager', extract: extractElectronZip },
  { name: 'Puppeteer browsers', extract: unpackArchive },
])('$name ZIP extraction', ({ extract }) => {
  it('extracts ordinary files', async () => {
    const archive = join(directory, 'browser.zip')
    const destination = join(directory, 'browser')
    await writeFile(archive, Buffer.from(normalZip, 'base64'))

    await extract(archive, destination)

    expect(await readFile(join(destination, 'file.txt'), 'utf8')).toBe(
      'browser payload'
    )
  })

  it.skipIf(process.platform === 'win32')(
    'preserves files and relative symlinks',
    async () => {
      const archive = join(directory, 'browser.zip')
      const destination = join(directory, 'browser')
      await writeFile(archive, Buffer.from(validZip, 'base64'))

      await extract(archive, destination)

      expect(await readFile(join(destination, 'file.txt'), 'utf8')).toBe(
        'browser payload'
      )
      expect(await readlink(join(destination, 'link'))).toBe('file.txt')
      expect(await readFile(join(destination, 'link'), 'utf8')).toBe(
        'browser payload'
      )
    }
  )

  it.skipIf(process.platform === 'win32')(
    'rejects symlinks outside the destination',
    async () => {
      const archive = join(directory, 'browser.zip')
      const destination = join(directory, 'browser')
      const outside = join(directory, 'outside.txt')
      await writeFile(archive, Buffer.from(traversalZip, 'base64'))
      await writeFile(outside, 'protected')

      await expect(extract(archive, destination)).rejects.toThrow()

      expect(await readFile(outside, 'utf8')).toBe('protected')
      await expect(readlink(join(destination, 'link'))).rejects.toMatchObject({
        code: 'ENOENT',
      })
    }
  )
})
