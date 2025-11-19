/// <reference types="wdio-electron-service" />
import type { Server } from 'http'

declare global {
  // eslint-disable-next-line no-var
  var testServer: Server | undefined
}

const getAppBinaryPath = () => {
  for (const arg of process.argv) {
    if (arg.startsWith('--app-path=')) {
      const path = arg.split('=')[1]
      console.log('Binary path:', path)
      return path
    }
  }
  console.log('No binary argument found, using default binary path')
  return undefined
}

export const config: WebdriverIO.Config = {
  runner: 'local',
  tsConfigPath: './test/tsconfig.json',
  specs: ['./specs/**/*.ts'],
  // Patterns to exclude.
  exclude: [
    // 'path/to/excluded/files'
  ],
  maxInstances: 1,
  capabilities: [
    {
      browserName: 'electron',
      // Electron service options
      // see https://webdriver.io/docs/desktop-testing/electron/configuration/#service-options
      'wdio:electronServiceOptions': {
        appBinaryPath: getAppBinaryPath(),
      },
    },
  ],

  // Level of logging verbosity: trace | debug | info | warn | error | silent
  logLevel: 'silent',
  bail: 0,
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  services: ['electron'],
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000,
  },

  onPrepare: async function () {
    const http = await import('http')

    const server = http.createServer((req, res) => {
      console.log(`[Test Server] ${req.method} ${req.url}`)
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end('<html><body><h1>k6 Studio E2E Test Server</h1></body></html>')
    })

    global.testServer = server

    await new Promise<void>((resolve) => {
      const PORT = 9999
      server.listen(PORT, () => {
        console.log(`✅ Test server listening on http://localhost:${PORT}`)
        resolve()
      })
    })
  },

  onComplete: async function () {
    const server = global.testServer
    if (server) {
      await new Promise<void>((resolve) => {
        server.close(() => {
          console.log('✅ Test server closed')
          resolve()
        })
      })
    }
  },

  // onWorkerStart: function (cid, caps, specs, args, execArgv) {
  // },

  // onWorkerEnd: function (cid, exitCode, specs, retries) {
  // },

  // beforeSession: function (config, capabilities, specs, cid) {
  // },

  // before: function (capabilities, specs) {
  // },

  // beforeCommand: function (commandName, args) {
  // },

  // beforeSuite: function (suite) {
  // },

  // beforeTest: function (test, context) {
  // },
  // beforeHook: function (test, context, hookName) {
  // },
  // afterHook: function (test, context, { error, result, duration, passed, retries }, hookName) {
  // },
  // afterTest: function(test, context, { error, result, duration, passed, retries }) {
  // },

  // afterSuite: function (suite) {
  // },
  // afterCommand: function (commandName, args, result, error) {
  // },
  // after: function (result, capabilities, specs) {
  // },
  // afterSession: function (config, capabilities, specs) {
  // },
  // onReload: function(oldSessionId, newSessionId) {
  // }
  // beforeAssertion: function(params) {
  // }
  // afterAssertion: function(params) {
  // }
}
