import { map } from './lazy'

type KeyAccessor<TKey, TNode> = (node: TNode) => TKey

export class Graph<TKey, TNode> {
  _nodes = new Map<TKey, TNode>()

  _ancestors = new Map<TKey, Set<TKey>>()
  _leafs = new Set<TKey>()

  keyOf: KeyAccessor<TKey, TNode>

  get size() {
    return this._nodes.size
  }

  constructor(keyAccessor: KeyAccessor<TKey, TNode>) {
    this.keyOf = keyAccessor
  }

  addNode(node: TNode) {
    const key = this.keyOf(node)

    this._nodes.set(key, node)

    this._ancestors.set(key, new Set())
    this._leafs.add(key)

    return this
  }

  addAncestors(target: TNode, ancestors: Iterable<TNode>) {
    const targetKey = this.keyOf(target)
    const targetAncestors = this._ancestors.get(targetKey) || new Set()

    const ancestorKeys = map(ancestors, this.keyOf)

    for (const ancestorKey of ancestorKeys) {
      //this.assert(targetKey, ancestorKey)

      targetAncestors.add(ancestorKey)

      this._leafs.delete(ancestorKey)
    }

    return this
  }

  get = (key: TKey): TNode | undefined => {
    return this._nodes.get(key)
  }

  all = (): Iterable<TNode> => {
    return this._nodes.values()
  }

  leafs = (): Iterable<TKey> => {
    return this._leafs
  }

  ancestors = (node: TNode): Iterable<TKey> => {
    return this._ancestors.get(this.keyOf(node)) || []
  }

  assert(sourceKey: TKey, targetKey: TKey) {
    if (!this._nodes.has(sourceKey)) {
      throw new RangeError(
        `Cannot add an edge from ${sourceKey} to ${targetKey} because ${sourceKey} has not been added to the graph.`
      )
    }

    if (!this._nodes.has(targetKey)) {
      throw new RangeError(
        `Cannot add an edge from ${sourceKey} to ${targetKey} because ${targetKey} has not been added to the graph.`
      )
    }
  }
}
