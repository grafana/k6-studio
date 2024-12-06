import { Graph } from '@/utils/graph/graph'
import { ResolvedEdge } from '@/utils/graph/types'

interface RangeLike {
  id: string
  started: number
  ended: number
}

export function buildGraph<T extends RangeLike>(nodes: Iterable<T>) {
  const graph = new Graph<T, null>()

  for (const node of nodes) {
    insertNode(graph, node)
  }

  return graph
}

function isStartInside<T extends RangeLike>(
  node: T,
  { from, to }: ResolvedEdge<T, null>
) {
  return node.started > from.value.ended && node.started <= to.value.ended
}

function isEndInside<T extends RangeLike>(
  node: T,
  { from, to }: ResolvedEdge<T, null>
) {
  return node.ended >= from.value.ended && node.ended < to.value.started
}

export function insertNode<T extends RangeLike>(
  graph: Graph<T, null>,
  node: T
) {
  // We begin by adding two dummy nodes to the graph that will make sure that
  // every node can be inserted at some edge. It's easier to do it this way
  // than to have to handle the edge cases of leaf nodes which won't have any
  // edges to insert into.
  const start = graph.addNode('$$start', {
    id: '$$start',
    started: Number.MIN_SAFE_INTEGER,
    ended: Number.MIN_SAFE_INTEGER,
  } as T)

  const end = graph.addNode('$$end', {
    id: '$$end',
    started: Number.MAX_SAFE_INTEGER,
    ended: Number.MAX_SAFE_INTEGER,
  } as T)

  for (const source of graph.sources()) {
    if (source.id === start.id || source.id === end.id) {
      continue
    }

    graph.setEdge(start.id, source.id, null)
  }

  for (const sink of graph.sinks()) {
    if (sink.id === start.id || sink.id === end.id) {
      continue
    }

    graph.setEdge(sink.id, end.id, null)
  }

  const added: Array<{ from: string; to: string }> = []
  const removed: Array<{ from: string; to: string }> = []

  for (const edge of graph.ancestors(
    end,
    (edge) => !isStartInside(node, edge)
  )) {
    const endInside = isEndInside(node, edge)
    const startInside = isStartInside(node, edge)

    if (startInside && endInside) {
      removed.push({ from: edge.from.id, to: edge.to.id })
    }

    if (startInside) {
      added.push({ from: edge.from.id, to: node.id })
    }

    if (endInside) {
      added.push({ from: node.id, to: edge.to.id })
    }
  }

  graph.addNode(node.id, node)

  for (const { from, to } of removed) {
    graph.removeEdge(from, to)
  }

  for (const { from, to } of added) {
    graph.setEdge(from, to, null)
  }

  // NOTE: Uncomment this to help with debugging. It will log links to a visual representation
  // of the graph at the end of the function.
  // console.log(
  //   graph.toGraphVizLink({
  //     nodeLabel: (node) => {
  //       if (node.id === start.id || node.id === end.id) {
  //         return node.id
  //       }

  //       return `${node.id}: ${node.started}-${node.ended}`
  //     },
  //   })
  // )

  // Clean up the start and end nodes, removing the edges.
  graph.removeNode(start)
  graph.removeNode(end)
}
