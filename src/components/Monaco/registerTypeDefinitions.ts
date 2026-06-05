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
