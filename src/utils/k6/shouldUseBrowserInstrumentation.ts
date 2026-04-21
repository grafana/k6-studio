import { readFile } from 'fs/promises'

import { K6Client } from '@/utils/k6/client'
import type { K6TestOptions } from '@/utils/k6/schema'

function hasBrowserScenario(options: K6TestOptions): boolean {
  if (!options.scenarios) {
    return false
  }
  return Object.values(options.scenarios).some(
    (scenario) => scenario.options?.browser != null
  )
}

function sourceImportsBrowser(source: string): boolean {
  return (
    /from\s+['"]k6\/browser['"]/.test(source) ||
    /import\s*\(\s*['"]k6\/browser['"]\s*\)/.test(source)
  )
}

/**
 * Validator runs wrap the user script with an instrumented entrypoint. Browser
 * scripts need `k6/browser` shims and session replay; plain HTTP scripts should
 * not load the browser module or extra machinery.
 */
export async function shouldUseBrowserInstrumentation(
  scriptPath: string
): Promise<boolean> {
  const client = new K6Client()
  const inspected = await client.inspect({ scriptPath }).catch(() => null)

  if (inspected !== null) {
    if (hasBrowserScenario(inspected)) {
      return true
    }
    const source = await readFile(scriptPath, 'utf-8')
    if (sourceImportsBrowser(source)) {
      return true
    }
    return false
  }

  const source = await readFile(scriptPath, 'utf-8')
  return sourceImportsBrowser(source)
}
