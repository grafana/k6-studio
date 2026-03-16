type NodeId = string

export interface GraphNode<T> {
  id: NodeId
  data: T
}

export interface GraphEdge<E> {
  from: NodeId
  to: NodeId
  data: E
}

interface QueueItem<T> {
  value: T
  next: QueueItem<T> | null
}

interface ToGraphVizOptions<T, E> {
  labelNode?: (node: GraphNode<T>) => string | null
  labelEdge?: (edge: GraphEdge<E>) => string | null
}

class Queue<T> {
  #first: QueueItem<T> | null = null
  #last: QueueItem<T> | null = null

  constructor(values: Iterable<T> = []) {
    for (const value of values) {
      this.push(value)
    }
  }

  push(value: T) {
    if (this.#last === null) {
      this.#first = { value, next: null }
      this.#last = this.#first
    } else {
      this.#last.next = { value, next: null }
      this.#last = this.#last.next
    }
  }

  pop() {
    if (this.#first === null) {
      return undefined
    }

    const value = this.#first.value

    this.#first = this.#first.next

    if (this.#first === null) {
      this.#last = null
    }

    return value
  }
}

class EdgeMap<E> {
  private edges = new Map<string, Map<string, GraphEdge<E>>>()

  get(from: NodeId, to: NodeId) {
    return this.edges.get(from)?.get(to)
  }

  set(from: NodeId, to: NodeId, edge: GraphEdge<E>) {
    const map = this.edges.get(from) ?? new Map<string, GraphEdge<E>>()

    map.set(to, edge)

    this.edges.set(from, map)
  }

  delete(from: NodeId, to: NodeId) {
    const map = this.edges.get(from)

    if (map === undefined) {
      return false
    }

    return map.delete(to)
  }

  count(from?: NodeId, filter?: (edge: GraphEdge<E>) => boolean) {
    if (filter !== undefined) {
      const edges =
        from === undefined
          ? Array.from(this.edges.values()).flatMap((map) =>
              Array.from(map.values())
            )
          : this.edges.get(from)?.values()

      return Array.from(edges ?? []).filter(filter).length
    }

    if (from === undefined) {
      return this.edges.size
    }

    return this.edges.get(from)?.size ?? 0
  }

  hasEdges(from: NodeId) {
    const edges = this.edges.get(from)

    return edges !== undefined && edges.size > 0
  }

  of(from: NodeId): Iterable<GraphEdge<E>> {
    return this.edges.get(from)?.values() ?? []
  }

  *all() {
    for (const map of this.edges.values()) {
      yield* map.values()
    }
  }
}

function toNodeId(node: GraphNode<unknown> | NodeId) {
  return typeof node === 'string' ? node : node.id
}

export class Graph<T, E> {
  #nodes = new Map<NodeId, GraphNode<T>>()

  #incoming = new EdgeMap<E>()
  #outgoing = new EdgeMap<E>()

  get count() {
    return {
      nodes: () => this.#nodes.size,
      edges: (filter?: (edge: GraphEdge<E>) => boolean) => {
        return {
          all: () => this.#incoming.count(undefined, filter),
          from: (node: GraphNode<T> | NodeId) =>
            this.#incoming.count(toNodeId(node), filter),
          to: (node: GraphNode<T> | NodeId) =>
            this.#outgoing.count(toNodeId(node), filter),
        }
      },
    }
  }

  add(node: GraphNode<T>) {
    this.#nodes.set(node.id, node)
  }

  require(id: NodeId): GraphNode<T> {
    const node = this.#nodes.get(id)

    if (node === undefined) {
      throw new Error(`Node with id '${id}' does not exist.`)
    }

    return node
  }

  connect(from: GraphNode<T> | NodeId, to: GraphNode<T> | NodeId, data: E) {
    const edge = {
      from: toNodeId(from),
      to: toNodeId(to),
      data,
    }

    if (!this.#nodes.has(edge.from)) {
      throw new Error(
        `Cannot connect node with id '${edge.from}' because it does not exist.`
      )
    }

    if (!this.#nodes.has(edge.to)) {
      throw new Error(
        `Cannot connect node with id '${edge.to}' because it does not exist.`
      )
    }

    if (this.isDescendant(edge.to, edge.from)) {
      throw new Error(
        `Cannot connect node '${edge.from}' to '${edge.to}' because it would create a cycle.`
      )
    }

    this.#outgoing.set(edge.from, edge.to, edge)
    this.#incoming.set(edge.to, edge.from, edge)
  }

  disconnect(from: GraphNode<T> | NodeId, to: GraphNode<T> | NodeId) {
    this.#outgoing.delete(toNodeId(from), toNodeId(to))
    this.#incoming.delete(toNodeId(to), toNodeId(from))
  }

  isDescendant(root: GraphNode<T> | NodeId, target: GraphNode<T> | NodeId) {
    const targetId = toNodeId(target)

    for (const descendant of this.descendants(root)) {
      if (descendant.id === targetId) {
        return true
      }
    }

    return false
  }

  outgoing(
    node: GraphNode<T> | NodeId,
    filter?: (edge: GraphEdge<E>) => boolean
  ) {
    const edges = this.#outgoing.of(toNodeId(node))

    if (filter === undefined) {
      return edges
    }

    return Array.from(edges).filter(filter)
  }

  incoming(
    node: GraphNode<T> | NodeId,
    filter?: (edge: GraphEdge<E>) => boolean
  ) {
    const edges = this.#incoming.of(toNodeId(node))

    if (filter === undefined) {
      return edges
    }

    return Array.from(edges).filter(filter)
  }

  *sources() {
    for (const node of this.#nodes.values()) {
      if (!this.#incoming.hasEdges(node.id)) {
        yield node
      }
    }
  }

  *sinks() {
    for (const node of this.#nodes.values()) {
      if (!this.#outgoing.hasEdges(node.id)) {
        yield node
      }
    }
  }

  *descendants(
    node: GraphNode<T> | NodeId,
    filter?: (edge: GraphEdge<E>) => boolean
  ): Generator<GraphNode<T>> {
    const queue = new Queue<NodeId>(
      Array.from(this.outgoing(node, filter)).map((edge) => edge.to)
    )

    let current: NodeId | undefined = queue.pop()

    while (current !== undefined) {
      const node = this.require(current)

      yield node

      for (const edge of this.outgoing(current, filter)) {
        queue.push(edge.to)
      }

      current = queue.pop()
    }
  }

  *ancestors(
    node: GraphNode<T> | NodeId,
    filter?: (edge: GraphEdge<E>) => boolean
  ): Generator<GraphNode<T>> {
    const queue = new Queue<NodeId>(
      Array.from(this.incoming(node, filter)).map((edge) => edge.from)
    )

    let current: NodeId | undefined = queue.pop()

    while (current !== undefined) {
      const node = this.require(current)

      yield node

      for (const edge of this.incoming(current, filter)) {
        queue.push(edge.from)
      }

      current = queue.pop()
    }
  }

  /**
   * Sorts the graph in topological order.
   */
  *sort() {
    const sources = [...this.sources()]
    const visited = new Set<NodeId>()

    let current = sources.pop()

    while (current !== undefined) {
      if (visited.has(current.id)) {
        current = sources.pop()

        continue
      }

      visited.add(current.id)

      yield current.data

      for (const edge of this.#outgoing.of(current.id)) {
        sources.push(this.require(edge.to))
      }

      current = sources.pop()
    }
  }

  clone() {
    const graph = new Graph<T, E>()

    for (const node of this.#nodes.values()) {
      graph.add(node)
    }

    for (const edge of this.#incoming.all()) {
      graph.connect(edge.from, edge.to, edge.data)
    }

    return graph
  }

  /**
   * A helper function to render the graph in GraphViz format. If you need a better understanding of
   * what the graph looks like you can run this through the debugger console, copy the output and
   * then use e.g. http://graph.flyte.org/ to visualize it.
   */
  toGraphViz({
    labelNode = () => null,
    labelEdge = () => null,
  }: ToGraphVizOptions<T, E> = {}) {
    const nodes = [...this.#nodes.values()]
      .map((node) => {
        const label = JSON.stringify(labelNode(node) ?? node.id)

        return `${JSON.stringify(node.id)} [label=${label}]`
      })
      .join('\n')

    const edges = [...this.#incoming.all()]
      .map((edge) => {
        const from = JSON.stringify(edge.from)
        const to = JSON.stringify(edge.to)

        const label = labelEdge(edge)

        if (label === null) {
          return `${from} -> ${to}`
        }

        return `${from} -> ${to} [label=${JSON.stringify(label)}]`
      })
      .join('\n')

    return `digraph G { 
  ${nodes}
  ${edges}
}`
  }
}
