import { describe, expect, it } from 'vitest'

import * as model from '../types'
import * as ir from './ast'
import { IntermediateContext } from './context'

function createPageNode(nodeId: string): model.PageNode {
  return {
    type: 'page',
    nodeId,
  }
}

function createGotoNode(nodeId: string, pageId: string): model.GotoNode {
  return {
    type: 'goto',
    nodeId,
    url: 'https://example.com',
    source: 'address-bar',
    inputs: {
      page: { nodeId: pageId },
    },
  }
}

function createNoopStatement(name: string): ir.ExpressionStatement {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'Identifier',
      name,
    },
  }
}

function allocatePage(context: IntermediateContext, node: model.PageNode, name: string) {
  context.allocate({
    node,
    name,
    value: { type: 'NewPageExpression' },
    dispose(target) {
      return {
        type: 'ExpressionStatement',
        expression: {
          type: 'ClosePageExpression',
          target,
        },
      }
    },
  })
}

describe('IntermediateContext allocations', () => {
  it('keeps allocation block open until all references are consumed', () => {
    const page = createPageNode('page')
    const firstGoto = createGotoNode('goto-1', 'page')
    const secondGoto = createGotoNode('goto-2', 'page')

    const context = new IntermediateContext({
      nodes: [page, firstGoto, secondGoto],
    })

    allocatePage(context, page, 'page')

    context.reference(page.nodeId)
    context.emit(createNoopStatement('first-use'))

    expect(() => context.done()).toThrow(
      'Cannot finalize context while still inside an allocation block. This is a bug!'
    )

    context.reference(page.nodeId)
    context.emit(createNoopStatement('second-use'))

    const statements = context.done()

    expect(statements).toHaveLength(1)
    expect(statements[0]?.type).toBe('Allocation')

    const allocation = statements[0] as ir.Allocation
    expect(allocation.statements).toEqual([
      createNoopStatement('first-use'),
      createNoopStatement('second-use'),
    ])
    expect(allocation.disposers).toHaveLength(1)
    expect(allocation.disposers[0]).toMatchObject({
      type: 'ExpressionStatement',
      expression: {
        type: 'ClosePageExpression',
        target: { type: 'Identifier' },
      },
    })
  })

  it('uses let null initializers for subsequent allocations and disposes in reverse order', () => {
    const firstPage = createPageNode('page-1')
    const secondPage = createPageNode('page-2')
    const firstGoto = createGotoNode('goto-1', 'page-1')
    const secondGoto = createGotoNode('goto-2', 'page-2')

    const context = new IntermediateContext({
      nodes: [firstPage, secondPage, firstGoto, secondGoto],
    })

    allocatePage(context, firstPage, 'firstPage')
    allocatePage(context, secondPage, 'secondPage')

    context.reference(firstPage.nodeId)
    context.emit(createNoopStatement('first-page-used'))
    context.reference(secondPage.nodeId)
    context.emit(createNoopStatement('second-page-used'))

    const statements = context.done()
    expect(statements).toHaveLength(1)
    expect(statements[0]?.type).toBe('Allocation')

    const allocation = statements[0] as ir.Allocation
    expect(allocation.declarations.map((declaration) => declaration.kind)).toEqual([
      'const',
      'let',
    ])
    expect(allocation.declarations[1]?.value).toEqual({ type: 'NullLiteral' })

    const assignment = allocation.statements[0]
    expect(assignment?.type).toBe('AssignmentStatement')
    expect(assignment).toMatchObject({
      type: 'AssignmentStatement',
      value: { type: 'NewPageExpression' },
    })

    const firstDeclarationName = allocation.declarations[0]?.name
    const secondDeclarationName = allocation.declarations[1]?.name

    expect(allocation.disposers).toHaveLength(2)
    expect(allocation.disposers[0]).toMatchObject({
      type: 'ExpressionStatement',
      expression: {
        type: 'ClosePageExpression',
        target: {
          type: 'Identifier',
          name: secondDeclarationName,
        },
      },
    })
    expect(allocation.disposers[1]).toMatchObject({
      type: 'ExpressionStatement',
      expression: {
        type: 'ClosePageExpression',
        target: {
          type: 'Identifier',
          name: firstDeclarationName,
        },
      },
    })
  })
})
