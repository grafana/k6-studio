import { pairwise } from './utils'
import {
  ResolvedEdge,
  NodeId,
  Edge,
  SerializedGraph,
  PathEdge,
  PathNode,
  NodeRef,
} from './types'

type CommonStyle = 'dashed' | 'dotted' | 'solid' | 'invis' | 'bold'

type NodeStyle =
  | CommonStyle
  | 'filled'
  | 'striped'
  | 'wedged'
  | 'diagonals'
  | 'rounded'

type EdgeStyle = CommonStyle | 'tapered'

interface ToGraphVizOptions<N, E> {
  nodeLabel?: (node: N) => string | undefined
  edgeLabel?: (edge: ResolvedEdge<N, E>) => string | undefined
  nodeStyle?: (node: N) => NodeStyle[]
  edgeStyle?: (edge: ResolvedEdge<N, E>) => EdgeStyle[]
}

class EdgeMap<E> {
  private edges = new Map<NodeId, Array<Edge<E>>>()

  get(nodeId: NodeId): Array<Edge<E>> {
    return this.edges.get(nodeId) ?? []
  }

  set(nodeId: NodeId, edge: Edge<E>): void {
    const edges = this.edges.get(nodeId) ?? []

    edges.push(edge)

    this.edges.set(nodeId, edges)
  }

  remove(nodeId: NodeId, edge: Edge<E>): void {
    const edges = this.edges.get(nodeId)

    if (edges === undefined) {
      return
    }

    this.edges.set(
      nodeId,
      edges.filter((e) => e.id !== edge.id)
    )
  }

  clone(): EdgeMap<E> {
    const clone = new EdgeMap<E>()

    for (const [nodeId, edges] of this.edges) {
      clone.edges.set(nodeId, [...edges])
    }

    return clone
  }
}

function toNodeId(node: Identifiable): NodeId {
  return typeof node === 'string' ? node : node.id
}

function toEdgeId(from: NodeId, to: NodeId): string {
  return `${from}->${to}`
}

type Identifiable = { id: NodeId } | NodeId

export class Graph<N, E> {
  static deserialize<N, E>(serialized: SerializedGraph<N, E>): Graph<N, E> {
    const graph = new Graph<N, E>()

    for (const [id, node] of Object.entries(serialized.nodes)) {
      graph.setNode(id, node)
    }

    for (const [from, toMap] of Object.entries(serialized.edges)) {
      for (const [to, edges] of Object.entries(toMap)) {
        for (const edge of edges) {
          graph.setEdge(from, to, edge)
        }
      }
    }

    return graph
  }

  private nodeMap = new Map<NodeId, NodeRef<N>>()

  private edgeMap = new Map<string, Edge<E>>()

  private incomingEdges = new EdgeMap<E>()
  private outgoingEdges = new EdgeMap<E>()

  /**
   * The number of nodes in the graph.
   */
  get order(): number {
    return this.nodeMap.size
  }

  /**
   * The number of edges in the graph.
   */
  get size(): number {
    return this.edgeMap.size
  }

  addNode(id: NodeId, node: N): N {
    this.setNode(id, node)

    return node
  }

  setNode(id: NodeId, node: N): void {
    this.nodeMap.set(id, {
      id,
      value: node,
    })
  }

  getNode(id: NodeId): N | undefined {
    return this.nodeMap.get(id)?.value
  }

  requireNode(id: NodeId): N {
    const node = this.getNode(id)

    if (node === undefined) {
      throw new Error(`Node with id "${id}" not found`)
    }

    return node
  }

  resolveNode(node: Identifiable): NodeRef<N> {
    const id = toNodeId(node)
    const ref = this.nodeMap.get(id)

    if (ref === undefined) {
      throw new Error(`Node with id "${id}" not found`)
    }

    return ref
  }

  removeNode(node: Identifiable): Edge<E>[] {
    const removed = this.nodeMap.delete(toNodeId(node))

    if (!removed) {
      return []
    }

    const edges = [...this.neighbours(node)]

    for (const edge of edges) {
      this.removeEdge(edge.from, edge.to)
    }

    return edges
  }

  setEdge(from: Identifiable, to: Identifiable, data: E): void {
    const fromId = toNodeId(from)
    const toId = toNodeId(to)

    if (!this.nodeMap.has(fromId)) {
      throw new Error(
        `Cannot create edge from non-existing node with id "${fromId}"`
      )
    }

    if (!this.nodeMap.has(toId)) {
      throw new Error(
        `Cannot create edge to non-existing node with id "${toId}"`
      )
    }

    this.removeEdge(fromId, toId)

    const edge = {
      id: toEdgeId(fromId, toId),
      from: fromId,
      to: toId,
      data,
    }

    this.outgoingEdges.set(fromId, edge)
    this.incomingEdges.set(toId, edge)

    this.edgeMap.set(edge.id, edge)
  }

  getEdge(from: Identifiable, to: Identifiable): Edge<E> | undefined {
    return this.edgeMap.get(toEdgeId(toNodeId(from), toNodeId(to)))
  }

  hasEdge(from: Identifiable, to: Identifiable): boolean {
    return this.getEdge(from, to) !== undefined
  }

  resolveEdge(edge: Edge<E>): ResolvedEdge<N, E> {
    return {
      id: edge.id,
      from: this.resolveNode(edge.from),
      to: this.resolveNode(edge.to),
      data: edge.data,
    }
  }

  removeEdge(from: Identifiable, to: Identifiable) {
    const fromId = toNodeId(from)
    const toId = toNodeId(to)

    const edge = this.edgeMap.get(toEdgeId(fromId, toId))

    if (edge === undefined) {
      return false
    }

    this.outgoingEdges.remove(fromId, edge)
    this.incomingEdges.remove(toId, edge)

    this.edgeMap.delete(edge.id)

    return true
  }

  addPath(edges: Array<PathEdge<N, E>>): void {
    for (const edge of edges) {
      this.setNode(edge.from.id, edge.from.value)
      this.setNode(edge.from.id, edge.to.value)

      this.setEdge(edge.from, edge.to, edge.data)
    }
  }

  addPathNodes(nodes: Array<PathNode<N>>, data: E): void {
    for (const [from, to] of pairwise(nodes)) {
      this.setNode(from.id, from.value)
      this.setNode(to.id, to.value)

      this.setEdge(from.id, to.id, data)
    }
  }

  hasPath(nodes: Array<PathNode<N>>): boolean {
    for (const [from, to] of pairwise(nodes)) {
      if (!this.hasEdge(from.id, to.id)) {
        return false
      }
    }

    return true
  }

  nodes(): Iterable<NodeRef<N>> {
    return this.nodeMap.values()
  }

  edges(): Iterable<Edge<E>> {
    return this.edgeMap.values()
  }

  *resolvedEdges(): Iterable<ResolvedEdge<N, E>> {
    for (const edge of this.edgeMap.values()) {
      yield this.resolveEdge(edge)
    }
  }

  outgoing(node: Identifiable): Iterable<Edge<E>> {
    return this.outgoingEdges.get(toNodeId(node))
  }

  incoming(node: Identifiable): Iterable<Edge<E>> {
    return this.incomingEdges.get(toNodeId(node))
  }

  *neighbours(node: Identifiable): Iterable<Edge<E>> {
    yield* this.outgoing(node)
    yield* this.incoming(node)
  }

  *descendants(node: Identifiable): Iterable<NodeRef<N>> {
    for (const edge of this.outgoing(node)) {
      const node = this.resolveNode(edge.to)

      yield node

      yield* this.descendants(node)
    }
  }

  *ancestors(node: Identifiable): Iterable<NodeRef<N>> {
    for (const edge of this.incoming(node)) {
      const node = this.resolveNode(edge.from)

      yield node

      yield* this.ancestors(node)
    }
  }

  isSource(node: Identifiable): boolean {
    return this.incomingEdges.get(toNodeId(node)).length === 0
  }

  *sources(): Iterable<NodeRef<N>> {
    for (const node of this.nodes()) {
      const edges = this.incomingEdges.get(node.id)

      if (edges.length === 0) {
        yield node
      }
    }
  }

  isSink(node: Identifiable): boolean {
    return this.outgoingEdges.get(toNodeId(node)).length === 0
  }

  *sinks(): Iterable<NodeRef<N>> {
    for (const node of this.nodes()) {
      const edges = this.outgoingEdges.get(node.id)

      if (edges.length === 0) {
        yield node
      }
    }
  }

  clone(): Graph<N, E> {
    const clone = new Graph<N, E>()

    for (const node of this.nodeMap.values()) {
      clone.setNode(node.id, node.value)
    }

    for (const edge of this.edgeMap.values()) {
      clone.setEdge(edge.from, edge.to, edge.data)
    }

    return clone
  }

  serialize(): SerializedGraph<N, E> {
    const nodes: SerializedGraph<N, E>['nodes'] = {}
    const edges: SerializedGraph<N, E>['edges'] = {}

    for (const node of this.nodes()) {
      nodes[node.id] = node.value
    }

    for (const edge of this.edges()) {
      const from = edge.from
      const to = edge.to

      if (!edges[from]) {
        edges[from] = {}
      }

      if (!edges[from][to]) {
        edges[from][to] = []
      }

      edges[from][to].push(edge.data)
    }

    return { nodes, edges }
  }

  toJSON() {
    return this.serialize()
  }

  /**
   * Dumps the graph to GraphViz format, so that the graph can be visualized using e.g.
   * https://dreampuf.github.io/GraphvizOnline/. Very useful for debugging.
   */
  toGraphViz({
    nodeLabel,
    edgeLabel,
    nodeStyle,
    edgeStyle,
  }: ToGraphVizOptions<N, E> = {}) {
    const nodes = Array.from(this.nodes()).map((node) => {
      const id = JSON.stringify(node.id)
      const attributes = {
        label: nodeLabel?.(node.value),
        style: nodeStyle?.(node.value).join(', '),
      }

      const attributeList = Object.entries(attributes)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
        .join(', ')

      if (attributeList.length === 0) {
        return id
      }

      return `${id} [${attributeList}]`
    })

    const edges = Array.from(this.resolvedEdges()).map((edge) => {
      const fromId = JSON.stringify(edge.from.id)
      const toId = JSON.stringify(edge.to.id)

      const attributes = {
        label: edgeLabel?.(edge),
        style: edgeStyle?.(edge).join(', '),
      }

      const attributeList = Object.entries(attributes)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
        .join(', ')

      if (attributeList.length === 0) {
        return `${fromId} -> ${toId}`
      }

      return `${fromId} -> ${toId} [${attributeList}]`
    })

    function indent(lines: string[]) {
      return lines.map((line) => `  ${line}`)
    }

    return ['digraph G {', ...indent([...nodes, '', ...edges]), '}'].join('\n')
  }

  /**
   * Convenience function for opening the graph in GraphVizOnline.
   */
  toGraphVizLink(options: ToGraphVizOptions<N, E> = {}) {
    const graphViz = this.toGraphViz(options)

    return `https://dreampuf.github.io/GraphvizOnline/#${encodeURIComponent(
      graphViz
    )}`
  }
}
