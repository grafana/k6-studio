import * as monaco from 'monaco-editor'

import * as path from '@/utils/path'

const k6TypeModules = import.meta.glob('/node_modules/@types/k6/**/*.d.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

let areTypesRegistered = false

function declareModule(specifier: string, content: string) {
  return `declare module "${specifier}" { ${content} }`
}

export function registerTypeDefinitions() {
  if (areTypesRegistered) {
    return
  }

  for (const [modulePath, moduleContent] of Object.entries(k6TypeModules)) {
    // global.d.ts declares ambient globals (e.g. `open`, `__ENV`) via
    // `declare global`. It must be registered as-is so those globals are
    // always available, regardless of which k6 submodule a script imports.
    if (path.basename(modulePath) === 'global.d.ts') {
      monaco.typescript.typescriptDefaults.addExtraLib(moduleContent)
      monaco.typescript.javascriptDefaults.addExtraLib(moduleContent)
      continue
    }

    const specifier = path
      .dirname(modulePath)
      .replace('/node_modules/@types/', '')

    monaco.typescript.typescriptDefaults.addExtraLib(
      declareModule(specifier, moduleContent)
    )

    monaco.typescript.javascriptDefaults.addExtraLib(
      declareModule(specifier, moduleContent)
    )
  }

  areTypesRegistered = true
}
