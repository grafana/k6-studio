import { groupBy } from 'lodash-es'

import { exhaustive } from '@/utils/typescript'

import { Graph } from '../graph'
import * as model from '../types'

import * as ir from './ast'

type ScenarioGraph = Graph<model.TestNode, null>

interface ConnectableNode {
  nodeId: model.NodeId
  inputs: {
    previous?: model.NodeRef
  }
}

function connectPrevious(
  graph: ScenarioGraph,
  { nodeId, inputs }: ConnectableNode
) {
  if (inputs.previous) {
    graph.connect(inputs.previous.nodeId, nodeId, null)
  }
}

function buildScenarioGraph(scenario: model.Scenario) {
  const graph = new Graph<model.TestNode, null>()

  for (const node of scenario.nodes) {
    graph.add({
      id: node.nodeId,
      data: node,
    })
  }

  for (const node of scenario.nodes) {
    switch (node.type) {
      case 'page':
        break

      case 'locator':
        graph.connect(node.nodeId, node.inputs.page.nodeId, null)
        break

      case 'goto':
      case 'reload':
        graph.connect(node.nodeId, node.inputs.page.nodeId, null)
        connectPrevious(graph, node)
        break

      case 'click':
        graph.connect(node.nodeId, node.inputs.locator.nodeId, null)
        connectPrevious(graph, node)
        break

      case 'type-text':
        graph.connect(node.nodeId, node.inputs.locator.nodeId, null)
        connectPrevious(graph, node)
        break

      case 'check':
        graph.connect(node.nodeId, node.inputs.locator.nodeId, null)
        connectPrevious(graph, node)
        break

      case 'select-options':
        graph.connect(node.nodeId, node.inputs.locator.nodeId, null)
        connectPrevious(graph, node)
        break

      case 'assert':
        graph.connect(node.nodeId, node.inputs.locator.nodeId, null)
        connectPrevious(graph, node)
        break

      default:
        return exhaustive(node)
    }
  }

  return graph
}

interface Temporary {
  nodeId: model.NodeId
  temp: string
  name: string
}

interface DeclareArgs {
  kind: 'const'
  node: model.TestNode
  name: string
  value: ir.Expression
}

export class IntermediateContext {
  #statements: ir.Statement[] = []

  #declarations = new Map<model.NodeId, Temporary>()
  #expressions = new Map<model.NodeId, ir.Expression>()

  graph: ScenarioGraph
  scenario: model.Scenario

  constructor(scenario: model.Scenario) {
    this.scenario = scenario
    this.graph = buildScenarioGraph(scenario)
  }

  /**
   * Declare a new variable and assign it the given expression. Referencing
   * the node in the future will return the variable name.
   */
  declare({ kind, node, name, value }: DeclareArgs) {
    // Since we don't know if there will be other variables using the same desired name,
    // we create a temporary variable name and then, in a later pass, resolve the variable
    // name to a unique version of the desired name.
    const temp = 'temp' + (this.#declarations.size + 1)

    const variable: Temporary = {
      nodeId: node.nodeId,
      temp,
      name,
    }

    this.#declarations.set(node.nodeId, variable)

    this.inline(node, {
      type: 'Identifier',
      name: temp,
    })

    this.emit({
      type: 'VariableDeclaration',
      kind,
      name: temp,
      value,
    })
  }

  /**
   * Inline the expression generated for the given node. Referencing the node in
   * the future will result in the expression being duplicated.
   */
  inline(node: model.TestNode, expression: ir.Expression) {
    if (this.#expressions.has(node.nodeId)) {
      throw new Error(
        `Expression for node ${node.nodeId} has already been declared.`
      )
    }

    this.#expressions.set(node.nodeId, expression)
  }

  reference(
    node: model.TestNode | model.NodeRef | model.NodeId
  ): ir.Expression {
    const id = typeof node === 'string' ? node : node.nodeId
    const expression = this.#expressions.get(id)

    if (!expression) {
      throw new Error(`Variable for node ${id} has not been declared.`)
    }

    return expression
  }

  emit(statement: ir.Statement) {
    this.#statements.push(statement)
  }

  nodes() {
    return this.graph.sort()
  }

  substitutions() {
    const conflicts = groupBy(
      [...this.#declarations.values()],
      (temp) => temp.name
    )

    const substitutions = new Map<string, string>()

    for (const [name, temps] of Object.entries(conflicts)) {
      // If there's only one variable with the name, we can just use it.
      if (temps.length === 1 && temps[0] !== undefined) {
        substitutions.set(temps[0].temp, name)

        continue
      }

      // If there are conflicts, then we append a number to the variable name. A more sophisticated
      // algorithm might allow the declaration site to generate alternatives to select from, e.g. by
      // looking at the URL of an HTTP request.
      temps.forEach((temp, index) => {
        substitutions.set(temp.temp, `${name}${index + 1}`)
      })
    }

    return substitutions
  }

  done() {
    return this.#statements
  }
}
