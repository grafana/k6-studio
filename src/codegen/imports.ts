import { ImportModule } from '@/types/imports'
import { exhaustive } from '@/utils/typescript'

export function generateImportStatement(importModule: ImportModule): string {
  const imports: string[] = []

  if (importModule.default) {
    imports.push(`${importModule.default.name}`)
  }

  if (importModule.imports) {
    switch (importModule.imports.type) {
      case 'named':
        imports.push(
          `{ ${importModule.imports.imports
            .map((i) => (i.alias ? `${i.name} as ${i.alias}` : i.name))
            .join(', ')} }`
        )
        break
      case 'namespace':
        imports.push(`* as ${importModule.imports.alias}`)
        break
      default:
        exhaustive(importModule.imports)
    }
  }

  // TODO: check if k6 supports side effect imports
  if (imports.length === 0) {
    return `import '${importModule.path}'`
  }

  return `import ${imports.join(', ')} from '${importModule.path}'`
}
