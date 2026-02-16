import { groupBy } from 'lodash-es'

import { exhaustive } from '@/utils/typescript'

import { Graph } from '../graph'
import * as model from '../types'

import * as ir from './ast'
import { CountedSet } from './utils'

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

      case 'wait-for':
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
  expression: ir.Identifier
}

interface AllocateArgs {
  node: model.TestNode
  name: string
  value: ir.Expression

  /**
   * Function that generates the dispose statement for the allocated resource. The expression
   * passed is the reference to the allocated resource, i.e. the variable that was declared for it.
   */
  dispose: (target: ir.Expression) => ir.Statement
}

interface DeclareArgs {
  kind: 'const' | 'let'
  node: model.TestNode
  name: string
  value: ir.Expression
}

interface FunctionBlock {
  type: 'function'
  statements: ir.Statement[]
}

interface AllocationBlock {
  type: 'allocation'
  initializers: DeclareArgs[]
  disposers: ir.Statement[]
  references: CountedSet<model.NodeId>
  statements: ir.Statement[]
}

type Block = FunctionBlock | AllocationBlock

export class IntermediateContext {
  #blocks: [Block, ...Block[]] = [
    {
      type: 'function',
      statements: [],
    },
  ]

  #declarations = new Map<model.NodeId, Temporary>()
  #expressions = new Map<model.NodeId, ir.Expression>()

  get #block() {
    return this.#blocks[0]
  }

  graph: ScenarioGraph
  scenario: model.Scenario

  constructor(scenario: model.Scenario) {
    this.scenario = scenario
    this.graph = buildScenarioGraph(scenario)
  }

  /**
   * Allocates a resource for the given node and ensures that it will be properly disposed.
   */
  allocate({ node, name, value, dispose }: AllocateArgs) {
    const temporary = this.#newDeclaration(node, name)

    this.inline(node, temporary.expression)

    const dependencies = [...this.graph.incoming(node.nodeId)]

    if (this.#block.type !== 'allocation') {
      // The first allocation in a block will be a const declaration outside
      // of the try-finally block, like so:
      //
      // ```
      // const resource = allocateResource()
      //
      // try {
      //  // code using resource
      // } finally {
      //   resource.cleanup()
      // }
      // ```
      const newBlock: AllocationBlock = {
        type: 'allocation',
        initializers: [{ kind: 'const', node, name: temporary.temp, value }],
        references: new CountedSet([[node.nodeId, dependencies.length]]),
        disposers: [dispose(temporary.expression)],
        statements: [],
      }

      this.#blocks = [newBlock, ...this.#blocks]

      return
    }

    // Subsequent allocations have to be let declarations so that the initial allocation
    // can be properly disposed if an error occurs when initializing a later resource.
    //
    // ```
    // const resource1 = allocateResource1()
    // let resource2 = null
    //
    // try {
    //  resource2 = allocateResource2()
    //  // code using resource1 and resource2
    // } finally {
    //   resource2?.cleanup()
    //   resource1.cleanup()
    // }
    // ```
    this.#block.initializers.push({
      kind: 'let',
      node,
      name: temporary.temp,
      value: {
        type: 'NullLiteral',
      },
    })

    // Add the references to the block so that it will live until all
    // dependent nodes have been processed.
    this.#block.references.add(node.nodeId, dependencies.length)

    this.#block.disposers.push(dispose(temporary.expression))

    // Initialize the variable inside the try-block.
    this.#block.statements.push({
      type: 'AssignmentStatement',
      target: {
        type: 'Identifier',
        name: temporary.temp,
      },
      value,
    })
  }

  /**
   * Declare a new variable and assign it the given expression. Referencing
   * the node in the future will return the variable name.
   */
  declare({ kind, node, name, value }: DeclareArgs) {
    // Since we don't know if there will be other variables using the same desired name,
    // we create a temporary variable name and then, in a later pass, resolve the variable
    // name to a unique version of the desired name.
    const temporary = this.#newDeclaration(node, name)

    this.inline(node, temporary.expression)

    this.emit({
      type: 'VariableDeclaration',
      kind,
      name: temporary.temp,
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

    if (this.#block.type === 'allocation') {
      this.#block.references.delete(id)
    }

    return expression
  }

  emit(statement: ir.Statement) {
    const [currentBlock, parentBlock, ...rest] = this.#blocks

    currentBlock.statements.push(statement)

    // Every time we emit a statement we check if it's the last statement in an
    // allocation block. This is the case if there are no longer any references to
    // any resources allocated in the block.
    if (
      currentBlock.type !== 'allocation' ||
      currentBlock.references.size > 0
    ) {
      return
    }

    if (parentBlock === undefined) {
      throw new Error(
        'Allocation block did not have a parent block. This is a bug!'
      )
    }

    // Now that the allocation block is done, we can declare all its variables and emit what will
    // eventually be the try-finally block that ensures proper disposal of the allocated resources.
    parentBlock.statements.push({
      type: 'Allocation',
      declarations: currentBlock.initializers.map(({ kind, name, value }) => ({
        type: 'VariableDeclaration',
        kind,
        name,
        value,
      })),
      statements: currentBlock.statements,
      disposers: currentBlock.disposers,
    })

    this.#blocks = [parentBlock, ...rest]
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
    if (this.#block.type !== 'function') {
      throw new Error(
        'Cannot finalize context while still inside an allocation block. This is a bug!'
      )
    }

    return this.#block.statements
  }

  #newDeclaration(node: model.TestNode, name: string): Temporary {
    const temp = 'temp' + this.#declarations.size + 1
    const temporary: Temporary = {
      nodeId: node.nodeId,
      temp,
      name,
      expression: {
        type: 'Identifier',
        name: temp,
      },
    }

    this.#declarations.set(node.nodeId, temporary)

    return temporary
  }
}
