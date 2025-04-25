import { TSESTree as ts } from '@typescript-eslint/types'

import { generateScriptHeader } from '@/codegen/codegen.utils'
import {
  declareConst,
  constDeclarator,
  identifier,
  exportNamed,
  program,
  exportDefault,
  declareFunction,
  block,
  importDeclaration,
  defaultImport,
  namedImport,
  string,
} from '@/codegen/estree'

import { spaceAfter, spaceBetween } from '../formatting/spacing'
import * as ir from '../intermediate/ast'

import { comment } from './comment'
import { CodeGenContext, Import } from './context'
import { emitOptions } from './options'
import { emitScenarioBody } from './scenario'

function emitImport(context: Import) {
  const namedImports = [...context.named].map((name) => {
    return namedImport({
      imported: identifier(name),
    })
  })

  const imports = [
    ...namedImports,
    context.default !== undefined &&
      defaultImport({
        local: identifier(context.default),
      }),
  ]

  return importDeclaration({
    source: string(context.from),
    specifiers: imports.filter((item) => item !== false),
  })
}

function emitScenario(
  context: CodeGenContext,
  name: string | undefined,
  scenario: ir.DefaultScenario | ir.Scenario
) {
  const scenarioContext = context.scenario()
  const body = emitScenarioBody(scenarioContext, scenario)

  return declareFunction({
    async: scenarioContext.async,
    id: name ? identifier(name) : undefined,
    params: [],
    body: block(body),
  })
}

export function toTypeScriptAst(test: ir.Test): ts.Program {
  const context = new CodeGenContext()

  const options = emitOptions(test)

  const defaultScenario =
    test.defaultScenario &&
    emitScenario(context, test.defaultScenario.name, test.defaultScenario)

  const scenarios = [
    defaultScenario &&
      exportDefault({
        declaration: defaultScenario,
      }),
  ]

  const imports = spaceAfter([...context.imports()].map(emitImport))

  const exports = spaceBetween([
    exportNamed({
      declaration: declareConst({
        declarations: [
          constDeclarator({
            id: identifier('options'),
            init: options,
          }),
        ],
      }),
    }),
    ...scenarios.filter((item) => item !== undefined),
  ])

  const header = spaceAfter([comment(generateScriptHeader())])

  return program({
    body: [...header, ...imports, ...exports],
  })
}
