import { parse } from '@typescript-eslint/typescript-estree'
import { describe, it } from 'vitest'

import { getExports } from '@/codegen/estree/traverse'

describe('getExports', () => {
  it('should get all exports', ({ expect }) => {
    const parsedScript = parse(`
      export default function () {}

      export function b() {}

      export const c = 1
      export const [d, e] = [1, 2]
      export const { f, g } = { f: 1, g: 2 }

      export const { 
        h, 
        i: { 
          j, 
          def: k 
        }, 
        l: [m, n, ...o], 
        ...p 
      } = {
        h: 1,
        i: { j: 2, k: 3 },
        l: [4, 5, 6],
        p: 7
      }

      export {
        q,
        r,
        s
      }

      export * from 'module'
    `)

    const result = getExports(parsedScript)

    expect(result).toEqual([
      expect.objectContaining({ type: 'default' }),
      expect.objectContaining({ type: 'named', name: 'b' }),
      expect.objectContaining({ type: 'named', name: 'c' }),
      expect.objectContaining({ type: 'named', name: 'd' }),
      expect.objectContaining({ type: 'named', name: 'e' }),
      expect.objectContaining({ type: 'named', name: 'f' }),
      expect.objectContaining({ type: 'named', name: 'g' }),
      expect.objectContaining({ type: 'named', name: 'h' }),
      expect.objectContaining({ type: 'named', name: 'j' }),
      expect.objectContaining({ type: 'named', name: 'k' }),
      expect.objectContaining({ type: 'named', name: 'm' }),
      expect.objectContaining({ type: 'named', name: 'n' }),
      expect.objectContaining({ type: 'named', name: 'o' }),
      expect.objectContaining({ type: 'named', name: 'p' }),
      expect.objectContaining({ type: 'named', name: 'q' }),
      expect.objectContaining({ type: 'named', name: 'r' }),
      expect.objectContaining({ type: 'named', name: 's' }),
      expect.objectContaining({ type: 'all' }),
    ])
  })
})
