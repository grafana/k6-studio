import { Test } from '../types'

// When more complicated stuff, like assertions, come into play we should have an
// intermediate AST that makes it easier to generate the final code, but for now we
// can just pass the test object through.
export function toIntermediateAst(test: Test) {
  return test
}
