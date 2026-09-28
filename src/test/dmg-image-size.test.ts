// @vitest-environment node

import { createDMG } from 'electron-installer-dmg'
import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { expect, test } from 'vitest'

function createTestApp(directory: string) {
  const appPath = path.join(directory, 'Test.app')
  fs.mkdirSync(path.join(appPath, 'Contents'), { recursive: true })
  fs.writeFileSync(path.join(appPath, 'Contents', 'Info.plist'), '')
  return appPath
}

async function createTestDMG(background?: string) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'k6-studio-dmg-'))
  try {
    await createDMG({
      appPath: createTestApp(directory),
      name: 'Test',
      out: directory,
      icon: path.join(__dirname, '../../resources/icons/logo.icns'),
      background,
    })
    const image = path.join(directory, 'Test.dmg')
    expect(
      execFileSync('hdiutil', ['imageinfo', image], { encoding: 'utf8' })
    ).toMatch(/Format: UDZO/)
  } finally {
    fs.rmSync(directory, { recursive: true, force: true })
  }
}

const macTest = test.skipIf(process.platform !== 'darwin')

macTest('the bundled ICNS parser does not hang on a zero-length entry', () => {
  const script = `
    const resolved = require.resolve('image-size', { paths: [require.resolve('appdmg')] })
    const exported = require(resolved)
    const imageSize = typeof exported === 'function' ? exported : exported.imageSize
    if (typeof imageSize !== 'function') throw new Error('Missing imageSize parser')
    const buffer = Buffer.alloc(24)
    buffer.write('icns', 0)
    buffer.writeUInt32BE(24, 4)
    buffer.write('icp4', 8)
    buffer.writeUInt32BE(8, 12)
    buffer.write('icp4', 16)
    try { imageSize(buffer) } catch {}
  `
  const child = spawnSync(process.execPath, ['-e', script], { timeout: 1500 })
  expect(child.error).toBeUndefined()
  expect(child.status).toBe(0)
})

macTest(
  'the DMG maker accepts its default background',
  async () => {
    await createTestDMG()
  },
  60_000
)

macTest(
  'the DMG maker accepts a custom background',
  async () => {
    await createTestDMG(path.join(__dirname, '../../resources/icons/logo.png'))
  },
  60_000
)

macTest(
  'the DMG maker reports an invalid background',
  async () => {
    const directory = fs.mkdtempSync(
      path.join(os.tmpdir(), 'k6-studio-dmg-error-')
    )
    try {
      const background = path.join(directory, 'invalid.png')
      fs.writeFileSync(background, 'invalid image')
      await expect(
        createDMG({
          appPath: createTestApp(directory),
          name: 'Test',
          out: directory,
          background,
        })
      ).rejects.toThrow(/unsupported file type/)
    } finally {
      fs.rmSync(directory, { recursive: true, force: true })
    }
  },
  60_000
)
