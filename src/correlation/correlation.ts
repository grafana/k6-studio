import { compareAsc } from 'date-fns'

import { Exchange } from './model/types'
import { ExtractedValue } from './types'
import { extract } from './extraction'
import { Tree } from './collections/Tree'
import { Graph } from './collections/Graph'

interface ExchangeNode {
  index: number
  exchange: Exchange
  values: ExtractedValue[]
}

interface Scope {
  ancestors: Iterable<number>
  contributions: Map<string, Correlatable>
  local: Map<string, Correlatable>
}

export interface Correlatable {
  index: number
  value: ExtractedValue
}

export interface Correlation {
  from: Correlatable
  to: Correlatable
}

const toGraph = (exchanges: Exchange[]) => {
  const nodes: ExchangeNode[] = exchanges.map((exchange, index) => ({
    exchange,
    index,
    values: extract({ body: exchange.response.body }),
  }))

  const byEndedDate = nodes.reduce(
    (tree, node) => tree.insert(node),
    Tree.empty<ExchangeNode>((l, r) =>
      compareAsc(l.exchange.ended, r.exchange.ended)
    )
  )

  return nodes.reduce(
    (result, node) => {
      const ancestors = byEndedDate.lessThan(node)

      return result.addNode(node).addAncestors(node, ancestors)
    },
    new Graph<number, ExchangeNode>((ex) => ex.index)
  )
}

const toVariableScopes = (graph: Graph<number, ExchangeNode>): Scope[] => {
  const scopes: Scope[] = Array<Scope>(graph.size)

  for (const node of graph.all()) {
    const contributions = new Map<string, Correlatable>()

    for (const value of node.values) {
      contributions.set(value.hash, { index: node.index, value })
    }

    scopes[node.index] = {
      ancestors: graph.ancestors(node),
      local: new Map(),
      contributions,
    }
  }

  for (const scope of scopes) {
    for (const index of scope.ancestors) {
      const ancestorScope = scopes[index]
      if (ancestorScope !== undefined) {
        for (const [hash, value] of ancestorScope.contributions) {
          scope.local.set(hash, value)
        }
      }
    }
  }

  return scopes
}

const toCorrelation = (from: Correlatable, to: Correlatable) => ({
  from,
  to,
})

const correlateWithRequest = (
  scopes: Scope[],
  node: ExchangeNode
): Correlation[] => {
  const values = extract({
    path: node.exchange.url.pathname,
    searchParams: node.exchange.url.searchParams,
    body: node.exchange.request.body,
    headers: node.exchange.request.headers,
  })

  const scope = scopes[node.index] || {
    ancestors: [],
    contributions: new Map<string, Correlatable>(),
    local: new Map<string, Correlatable>(),
  }

  return values.flatMap((value) => {
    const correlatable = scope.local.get(value.hash)

    if (correlatable === undefined) {
      return []
    }

    return [
      toCorrelation(correlatable, {
        index: node.index,
        value,
      }),
    ]
  })
}

export const findCorrelations = (exchanges: Exchange[]): Correlation[] => {
  const graph = toGraph(exchanges)
  const scopes = toVariableScopes(graph)

  return [...graph.all()].flatMap((node) => correlateWithRequest(scopes, node))
}
