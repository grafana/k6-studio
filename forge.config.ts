import { FuseV1Options, FuseVersion } from '@electron/fuses'
import { MakerDeb } from '@electron-forge/maker-deb'
import { MakerDMG } from '@electron-forge/maker-dmg'
import { MakerRpm } from '@electron-forge/maker-rpm'
import { MakerSquirrel } from '@electron-forge/maker-squirrel'
import { MakerZIP } from '@electron-forge/maker-zip'
import { FusesPlugin } from '@electron-forge/plugin-fuses'
import { VitePlugin } from '@electron-forge/plugin-vite'
import type { ForgeConfig } from '@electron-forge/shared-types'
import { spawn } from 'node:child_process'
import path from 'path'

import { CUSTOM_APP_PROTOCOL } from './src/main/deepLinks.constants'
import { getPlatform, getArch } from './src/utils/electron'
import { windowsSign } from './windowsSign'

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

const config: ForgeConfig = {
  hooks: {
    postMake: async (forgeConfig, options) => {
      const artifactPaths = options.flatMap((o) => o.artifacts)

      const signingPromises = artifactPaths.map((filePath) => {
        return new Promise<void>((resolve, reject) => {
          console.log(`File to sign post make: ${filePath}`)

          const signToolPath = process.env.SIGNTOOL_PATH
          if (!signToolPath) {
            reject(new Error('SIGNTOOL_PATH environment variable is not set'))
            return
          }

          const args = [
            'code',
            'trusted-signing',
            filePath,
            '-td',
            'sha256',
            '-fd',
            'sha256',
            '--trusted-signing-account',
            process.env.TRUSTED_SIGNING_ACCOUNT!,
            '--trusted-signing-certificate-profile',
            process.env.TRUSTED_SIGNING_PROFILE!,
            '--trusted-signing-endpoint',
            process.env.TRUSTED_SIGNING_ENDPOINT!,
          ]

          const signingProc = spawn(signToolPath, args, {
            env: process.env,
            cwd: process.cwd(),
            stdio: 'inherit',
          })

          signingProc.on('close', (code) => {
            if (code === 0) {
              console.log(`Successfully signed: ${filePath}`)
              resolve()
            } else {
              reject(
                new Error(`Signing failed with code ${code} for ${filePath}`)
              )
            }
          })

          signingProc.on('error', (error) => {
            reject(
              new Error(`Failed to spawn signing process: ${error.message}`)
            )
          })
        })
      })

      await Promise.all(signingPromises)
      return options
    },
  },
  packagerConfig: {
    executableName: 'k6-studio',
    icon: './resources/icons/logo',
    asar: true,
    extraResource: [
      '.vite/build/extension',
      './resources/shims',
      './resources/json_output.py',
      './resources/group_snippet.js',
      './resources/checks_snippet.js',
      './resources/splashscreen.html',
      './resources/logo-splashscreen-dark.svg',
      './resources/logo-splashscreen.svg',
      ...getPlatformSpecificResources(),
    ],
    windowsSign,
    osxSign: {
      optionsForFile: () => {
        return {
          entitlements: './entitlements.plist',
        }
      },
    },
    osxNotarize: {
      appleApiKey: process.env.APPLE_API_KEY ?? '',
      appleApiKeyId: process.env.APPLE_API_KEY_ID ?? '',
      appleApiIssuer: process.env.APPLE_API_ISSUER ?? '',
    },
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
          config: 'vite.extension.config.mts',
        },
        {
          // Entry doesn't really matter here.
          entry: 'src/main/runner/shims/browser/index.ts',
          config: 'vite.shims.config.ts',
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
