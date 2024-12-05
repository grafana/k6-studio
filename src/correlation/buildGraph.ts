import { Graph } from '@/utils/graph/graph'
import { NodeRef, ResolvedEdge } from '@/utils/graph/types'

// TODO: Use an optimized queue implementation.
class Queue<T> {
  private items: T[]

  constructor(items: Iterable<T> = []) {
    this.items = Array.from(items)
  }

  get length() {
    return this.items.length
  }

  enqueue(item: T[] | T) {
    if (Array.isArray(item)) {
      this.items.push(...item)

      return
    }

    this.items.push(item)
  }

  dequeue() {
    return this.items.shift()
  }

  clear() {
    this.items = []
  }
}

interface RangeLike {
  id: string
  start: number
  end: number
}

export function buildGraph<T extends RangeLike>(nodes: Iterable<T>) {
  const graph = new Graph<T, null>()

  for (const node of nodes) {
    insertNode(graph, node)
  }

  return graph
}

function isStartedInside<T extends RangeLike>(
  node: T,
  { from, to }: ResolvedEdge<T, null>
) {
  return node.start > from.value.end && node.start <= to.value.start
}

function isEndedInside<T extends RangeLike>(
  node: T,
  { from, to }: ResolvedEdge<T, null>
) {
  return node.end >= from.value.end && node.end < to.value.start
}

export function insertNode<T extends RangeLike>(
  graph: Graph<T, null>,
  node: T
) {
  let queue = new Queue(graph.sinks())
  let visited = new Set<string>()

  let current = queue.dequeue()

  const startNodes = new Map<string, NodeRef<T>>()

  const added: Array<{ from: string; to: string }> = []
  const removed: Array<{ from: string; to: string }> = []

  while (current !== undefined) {
    if (visited.has(current.id)) {
      current = queue.dequeue()

      continue
    }

    visited.add(current.id)

    if (graph.isSource(current)) {
      if (node.end < current.value.start) {
        added.push({ from: node.id, to: current.id })
      }

      if (node.start > current.value.end) {
        added.push({ from: current.id, to: node.id })

        startNodes.set(current.id, current)
      }

      current = queue.dequeue()

      continue
    }

    if (graph.isSink(current) && node.start > current.value.end) {
      added.push({ from: current.id, to: node.id })

      current = queue.dequeue()

      continue
    }

    for (const incoming of graph.incoming(current)) {
      const resolved = graph.resolveEdge(incoming)

      if (isStartedInside(node, resolved)) {
        added.push({ from: resolved.from.id, to: node.id })

        startNodes.set(resolved.from.id, resolved.from)

        continue
      }

      queue.enqueue(resolved.from)
    }

    current = queue.dequeue()
  }

  queue = new Queue(startNodes.values())
  visited = new Set<string>()

  current = queue.dequeue()

  while (current !== undefined) {
    if (visited.has(current.id)) {
      current = queue.dequeue()

      continue
    }

    visited.add(current.id)

    for (const outgoing of graph.outgoing(current)) {
      const resolved = graph.resolveEdge(outgoing)

      if (isEndedInside(node, resolved)) {
        added.push({
          from: node.id,
          to: resolved.to.id,
        })

        // If it's a start node, we need to split the edge.
        if (startNodes.has(resolved.from.id)) {
          removed.push({
            from: resolved.from.id,
            to: resolved.to.id,
          })
        }

        continue
      }

      queue.enqueue(resolved.to)
    }

    current = queue.dequeue()
  }

  graph.addNode(node.id, node)

  for (const { from, to } of removed) {
    graph.removeEdge(from, to)
  }

  for (const { from, to } of added) {
    graph.setEdge(from, to, null)
  }

  // NOTE: Uncomment this to help with debugging. It will log links to a visual representation
  // of the graph at each iteration of this function.
  // console.log(graph.toGraphVizLink())
}
