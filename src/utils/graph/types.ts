export type NodeId = string

export interface GraphNode {
  id: NodeId
}

export interface Edge<E> {
  id: string
  from: NodeId
  to: NodeId
  data: E
}

export interface NodeRef<N> {
  id: NodeId
  value: N
}

export interface ResolvedEdge<N, E> {
  id: string
  from: NodeRef<N>
  to: NodeRef<N>
  data: E
}

export interface PathEdge<N, E> {
  from: NodeRef<N>
  to: NodeRef<N>
  data: E
}

export interface PathNode<N> {
  id: NodeId
  value: N
  distance: number
}

export interface Path<N, E> {
  distance: number
  nodes: Array<PathNode<N>>
  edges: Array<PathEdge<N, E>>
}

export interface SerializedGraph<N, E> {
  nodes: {
    [id: NodeId]: N
  }
  edges: {
    [from: string]: {
      [to: string]: Array<E>
    }
  }
}
