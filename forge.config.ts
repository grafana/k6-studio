import { MakerDeb } from '@electron-forge/maker-deb'
import { MakerDMG } from '@electron-forge/maker-dmg'
import { MakerRpm } from '@electron-forge/maker-rpm'
import { MakerSquirrel } from '@electron-forge/maker-squirrel'
import { MakerZIP } from '@electron-forge/maker-zip'
import { FusesPlugin } from '@electron-forge/plugin-fuses'
import { VitePlugin } from '@electron-forge/plugin-vite'
import type { ForgeConfig, ForgeMakeResult } from '@electron-forge/shared-types'
import { FuseV1Options, FuseVersion } from '@electron/fuses'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'path'

import { CUSTOM_APP_PROTOCOL } from './src/main/deepLinks.constants'
import { getPlatform, getArch } from './src/utils/electron'
import { windowsSign } from './windowsSign'
import { spawnSignFile } from './windowsSignHook'

function getPlatformSpecificResources() {
  // on mac we are using a single image to build both architectures so we
  // will need to include both binaries in the final package for it to work.
  // Otherwise the x86_64 build will still be having the resources/arm64 only binaries
  if (getPlatform() === 'mac') {
    return ['./resources/mac/arm64', './resources/mac/x86_64']
  } else if (getPlatform() === 'linux') {
    return ['./resources/linux/arm64', './resources/linux/x86_64']
  }

  return [path.join('./resources/', getPlatform(), getArch())]
}

function getPostPackageHook() {
  // Release signs with a real Developer ID via osxSign and notarizes, producing
  // a valid signature. Creds-free builds (smoke tests) need a valid signature
  // too: on Apple Silicon an app with an invalid signature is killed on launch,
  // and the integrity fuse enforces a signed asar hash. The fuses plugin rewrites
  // the binary after packaging, invalidating any earlier signature, so apply a
  // deep ad-hoc signature as the final step. Config hooks run after plugin hooks,
  // so this lands after the fuse flip. No-op off macOS or when releasing.
  if (getPlatform() !== 'mac' || process.env.APPLE_API_KEY) {
    return undefined
  }

  return (
    _forgeConfig: ForgeConfig,
    { outputPaths }: { outputPaths: string[] }
  ) => {
    for (const outputPath of outputPaths) {
      const appBundle = fs
        .readdirSync(outputPath)
        .find((entry) => entry.endsWith('.app'))

      if (appBundle) {
        execFileSync('codesign', [
          '--force',
          '--deep',
          '--sign',
          '-',
          path.join(outputPath, appBundle),
        ])
      }
    }

    return Promise.resolve()
  }
}

function getPostMakeHook() {
  // we use the hook function only on windows to sign the binary so in
  // all other cases we just return an empty object
  if (getPlatform() !== 'win') {
    return (forgeConfig: ForgeConfig, makeResults: ForgeMakeResult[]) =>
      Promise.resolve(makeResults)
  }

  return async (forgeConfig: ForgeConfig, makeResults: ForgeMakeResult[]) => {
    const artifactPaths = makeResults.flatMap((o) => o.artifacts)

    // Only sign .exe artifacts. Signing the Squirrel *.nupkg via NuGet's
    // package-signing format changes its size, but MakerSquirrel has already
    // written the original size + sha1 into the RELEASES file by this point.
    // The mismatch makes Squirrel.Windows abort updates with a checksum error
    // and the "restart to update" dialog never fires.
    const signingPromises = artifactPaths
      .filter((filePath) => filePath.toLowerCase().endsWith('.exe'))
      .map((filePath) => spawnSignFile(filePath))

    await Promise.all(signingPromises)
    return makeResults
  }
}

const config: ForgeConfig = {
  // this is an hack for signing windows binaries: https://github.com/grafana/k6-studio/pull/869#discussion_r2454584477
  hooks: {
    postPackage: getPostPackageHook(),
    postMake: getPostMakeHook(),
  },
  packagerConfig: {
    executableName: 'k6-studio',
    icon: './resources/icons/logo',
    asar: true,
    extraResource: [
      './resources/browser',
      './resources/json_output.py',
      './resources/entrypoint.js',
      './resources/replay.js',
      './resources/k6-testing.js',
      ...getPlatformSpecificResources(),
    ],
    // Windows signing relies on the Azure Trusted Signing tool. Only enable it
    // when SIGNTOOL_PATH is present (release), otherwise the hook rejects and a
    // creds-free `package` (smoke builds) would fail.
    windowsSign: process.env.SIGNTOOL_PATH ? windowsSign : undefined,
    // Sign with the keychain Developer ID only in release. Creds-free smoke
    // builds skip this and get a deep ad-hoc signature from the postPackage hook
    // instead -- signing here as well would race the fuse flip and leave an
    // invalid signature the OS refuses to launch.
    osxSign: process.env.APPLE_API_KEY
      ? {
          optionsForFile: () => {
            return {
              entitlements: './entitlements.plist',
            }
          },
        }
      : undefined,
    // Notarization uploads to Apple and requires real credentials, so only run
    // it when they are present. Smoke builds skip it.
    osxNotarize: process.env.APPLE_API_KEY
      ? {
          appleApiKey: process.env.APPLE_API_KEY,
          appleApiKeyId: process.env.APPLE_API_KEY_ID ?? '',
          appleApiIssuer: process.env.APPLE_API_ISSUER ?? '',
        }
      : undefined,
    protocols: [
      {
        name: CUSTOM_APP_PROTOCOL,
        schemes: [CUSTOM_APP_PROTOCOL],
      },
    ],
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      iconUrl:
        'https://raw.githubusercontent.com/grafana/k6-studio/refs/heads/main/resources/icons/logo.ico',
    }),
    new MakerZIP({}, ['darwin']),
    new MakerDMG(
      {
        icon: './resources/icons/logo.icns',
      },
      ['darwin']
    ),
    new MakerRpm({ options: { icon: './resources/icons/logo.png' } }),
    new MakerDeb({
      options: {
        icon: './resources/icons/logo.png',
        mimeType: [`x-scheme-handler/${CUSTOM_APP_PROTOCOL}`],
      },
    }),
  ],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: 'src/main.ts',
          config: 'vite.main.config.ts',
        },
        {
          entry: 'src/preload.ts',
          config: 'vite.preload.config.ts',
        },
        {
          // Entry doesn't really matter here.
          entry: 'src/recorder/browser/index.ts',
          config: 'vite.browser.config.mts',
        },
        {
          // Entry doesn't really matter here.
          entry: 'src/main/runner/entrypoint.ts',
          config: 'vite.script.config.ts',
        },
        {
          // Entry doesn't really matter here.
          entry: 'src/main/runner/shims/browser/replay.ts',
          config: 'vite.replay.config.ts',
        },
        {
          // Entry doesn't really matter here.
          entry: 'src/main/runner/shims/k6-testing/index.ts',
          config: 'vite.k6-testing.config.ts',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'grafana',
          name: 'k6-studio',
        },
        prerelease: true,
      },
    },
  ],
}

export default config
