/**
 * Parses `--studio-bridge-port=<n>` from Electron/Chromium argv.
 */

export function getStudioBridgePort(): number | undefined {
  const prefix = '--studio-bridge-port='

  for (const arg of process.argv) {
    if (arg.startsWith(prefix)) {
      const n = Number(arg.slice(prefix.length))
      if (Number.isFinite(n) && n > 0 && n < 65536) {
        return n
      }
    }
  }

  const envPort = process.env.K6_STUDIO_BRIDGE_PORT
  if (envPort !== undefined && envPort !== '') {
    const n = Number(envPort)
    if (Number.isFinite(n) && n > 0 && n < 65536) {
      return n
    }
  }

  return undefined
}
