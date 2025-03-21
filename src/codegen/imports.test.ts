import { describe, expect, it } from 'vitest'

import { generateImportStatement } from './imports'

describe('Code generation - imports', () => {
  it('should generate side effect import statement if only path is passed', () => {
    expect(generateImportStatement({ path: 'myModule' })).toBe(
      "import 'myModule'"
    )
  })

  it('should generate default import statement', () => {
    expect(
      generateImportStatement({
        path: 'myModule',
        default: { name: 'defaultImport' },
      })
    ).toBe("import defaultImport from 'myModule'")
  })

  it('should generate named import statement', () => {
    expect(
      generateImportStatement({
        path: 'myModule',
        imports: {
          type: 'named',
          imports: [
            { name: 'namedImport' },
            { name: 'namedImport2', alias: 'alias' },
          ],
        },
      })
    ).toBe("import { namedImport, namedImport2 as alias } from 'myModule'")
  })

  it('should generate namespace import statement', () => {
    expect(
      generateImportStatement({
        path: 'myModule',
        imports: {
          type: 'namespace',
          alias: 'myModule',
        },
      })
    ).toBe("import * as myModule from 'myModule'")
  })

  it('should generate default and namespace import statement', () => {
    expect(
      generateImportStatement({
        path: 'myModule',
        default: { name: 'defaultImport' },
        imports: {
          type: 'namespace',
          alias: 'myModule',
        },
      })
    ).toBe("import defaultImport, * as myModule from 'myModule'")
  })

  it('should generate default and named import statement', () => {
    expect(
      generateImportStatement({
        path: 'myModule',
        default: { name: 'defaultImport' },
        imports: {
          type: 'named',
          imports: [
            { name: 'namedImport' },
            { name: 'namedImport2', alias: 'alias' },
          ],
        },
      })
    ).toBe(
      "import defaultImport, { namedImport, namedImport2 as alias } from 'myModule'"
    )
  })
})
