import { exhaustive } from '@/utils/typescript'
import * as m from '../types'
import * as ir from './ast'
import { IntermediateContext } from './context'
import { substituteVariables } from './variables'

function emitPageNode(context: IntermediateContext, node: m.PageNode) {
  const expression: ir.NewPageExpression = {
    type: 'NewPageExpression',
  }

  context.declare({
    kind: 'const',
    node,
    name: 'page',
    value: expression,
  })
}

const emitGotoNode = (context: IntermediateContext, node: m.GotoNode) => {
  const page = context.reference(node.ports.page.nodeId)

  context.emit({
    type: 'ExpressionStatement',
    expression: {
      type: 'GotoExpression',
      target: page,
      url: {
        type: 'StringLiteral',
        value: node.url,
      },
    },
  })
}

const emitReloadNode = (context: IntermediateContext, node: m.ReloadNode) => {
  const page = context.reference(node.ports.page.nodeId)

  context.emit({
    type: 'ExpressionStatement',
    expression: {
      type: 'ReloadExpression',
      target: page,
    },
  })
}

function emitNode(context: IntermediateContext, node: m.TestNode) {
  switch (node.type) {
    case 'page':
      return emitPageNode(context, node)

    case 'goto':
      return emitGotoNode(context, node)

    case 'reload':
      return emitReloadNode(context, node)

    default:
      return exhaustive(node)
  }
}

function emitScenario(scenario: m.Scenario): ir.Scenario {
  const context = new IntermediateContext(scenario)

  for (const node of scenario.nodes) {
    emitNode(context, node)
  }

  return substituteVariables(context, {
    type: 'Scenario',
    body: context.done(),
  })
}

function emitDefaultScenario(scenario: m.DefaultScenario): ir.DefaultScenario {
  const intermediate = emitScenario(scenario)

  return {
    ...intermediate,
    name: scenario.name,
  }
}

export function toIntermediateAst(test: m.Test): ir.Test {
  const scenarios = Object.entries(test.scenarios).map(([name, scenario]) => {
    const intermediate = emitScenario(scenario)

    return [name, intermediate] as const
  })

  return {
    defaultScenario:
      test.defaultScenario && emitDefaultScenario(test.defaultScenario),
    scenarios: Object.fromEntries(scenarios),
  }
}
