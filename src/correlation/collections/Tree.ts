type Comparer<T> = (l: T, r: T) => number

const defaultComparer = <T>(l: T, r: T) => {
  if (l < r) {
    return -1
  }

  if (l > r) {
    return 1
  }

  return 0
}

interface ValueNode<T> {
  value: T

  left: TreeNode<T>
  right: TreeNode<T>

  height: number
}

type TreeNode<T> = ValueNode<T> | null

const heightOf = <T>(node: TreeNode<T>): number =>
  node === null ? 0 : node.height

const createNode = <T>(left: TreeNode<T>, value: T, right: TreeNode<T>) => ({
  value,

  left,
  right,

  height: Math.max(heightOf(left), heightOf(right)) + 1,
})

const rotateRight = <T>(node: ValueNode<T>): ValueNode<T> => {
  if (node.left === null) {
    throw new Error(
      'Left node can not be null when rotating right. This should not happen!'
    )
  }

  //
  //         Unbalanced   ->   Balanced
  //
  //             50               40
  //            /  \             /  \
  //          40    60         30    50
  //         /  \             /     /  \
  //       30    45         20    45    60
  //      /
  //    20
  //

  const l = node.left.left
  const r = createNode(node.left.right, node.value, node.right)

  return createNode(l, node.left.value, r)
}

const rotateLeft = <T>(node: ValueNode<T>): ValueNode<T> => {
  if (node.right === null) {
    throw new Error(
      'Right node can not be null when rotating left. This should not happen!'
    )
  }

  //
  //         Unbalanced    ->    Balanced
  //
  //             30                 40
  //            /  \               /  \
  //          20    40           30    50
  //               /  \         /  \     \
  //              35   50     20    35    60
  //                     \
  //                      60

  const l = createNode(node.left, node.value, node.right.left)
  const r = node.right.right

  return createNode(l, node.right.value, r)
}

const insertUnbalanced = <T>(
  node: TreeNode<T>,
  value: T,
  compare: Comparer<T>
): ValueNode<T> => {
  if (node === null) {
    return createNode(null, value, null)
  }

  const order = compare(value, node.value)

  // Insert the new node in the correct branch of the tree, i.e. values less than
  // the current node in the left tree and values greater in the right. If the value
  // is equal, we'll keep it in the right side, to allow for duplicates.
  const left = order < 0 ? insert(node.left, value, compare) : node.left
  const right = order >= 0 ? insert(node.right, value, compare) : node.right

  return createNode(left, node.value, right)
}

const insert = <T>(
  node: ValueNode<T> | null,
  value: T,
  compare: Comparer<T>
): ValueNode<T> => {
  return balance(insertUnbalanced(node, value, compare))
}

const getBalance = <T>(node: ValueNode<T>) =>
  heightOf(node.left) - heightOf(node.right)
const isBalanced = (balance: number): boolean => balance > -2 && balance < 2

const balance = <T>(root: ValueNode<T>): ValueNode<T> => {
  // We need to check to see if the tree is still balanced. A balanced tree
  // will only ever have a height difference of 1 between its branches.
  const balance = getBalance(root)

  // Are we already balanced?
  if (isBalanced(balance)) {
    return root
  }

  const left = root.left
  const right = root.right

  // Ok, so we're unbalanced. Sigh. Now we need to determine if it's the
  // left or right branch whose height is to high. Luckily, we can determine
  // this from the balance factor: if it's negative then the right side's
  // height was greater and if it's positive the left side was greater.
  const isNegative = balance < 0

  if (isNegative) {
    if (right === null) {
      throw new Error(
        'A right-heavy unbalanced tree should never have an empty node in the right-hand side.'
      )
    }

    // Ok, so it was the right side. Now we want to re-arrange the nodes so
    // that they are balanced. This is done by "rotating" the nodes. Like before
    // we need to know which branch of the right child is too long, so that
    // we can handle two different cases.
    const rightBalance = heightOf(right.left) - heightOf(right.right)

    if (rightBalance < 0) {
      // This is the simplest case. The longest branch is the right-right node,
      // so we can move around the right node without caring about the right-left
      // node: the left node will still be less than the right node. We can get
      // away with simply rotating the node left, i.e. in the opposite direction.
      return rotateLeft(root)
    }

    // So the right-left branch is the longest. That means that there is a value
    // that is greater than the parent node but less than its right child. We can't
    // do a simple rotate left like above, because then the parent node would be
    // moved to the left but the right-left would remain on the right side. This
    // would mean losing the property of lesser values to the left and greater to
    // the right.

    return rotateLeft(createNode(left, root.value, rotateRight(right)))
  }

  // Here we handle the left side. It's the same logic as above, but in the
  // opposite direction.

  if (left === null) {
    throw new Error(
      'A right-heavy unbalanced tree should never have an empty node in the right-hand side.'
    )
  }

  const leftBalance = heightOf(left.left) - heightOf(left.right)

  if (leftBalance > 0) {
    return rotateRight(root)
  }

  return rotateRight(createNode(rotateLeft(left), root.value, right))
}

function* traverseAsc<T>(node: TreeNode<T>): Generator<T> {
  if (node === null) {
    return
  }

  yield* traverseAsc(node.left)
  yield node.value
  yield* traverseAsc(node.right)
}

const lessThan = <T>(
  node: TreeNode<T>,
  value: T,
  compare: Comparer<T>
): TreeNode<T> => {
  if (node === null) {
    return null
  }

  const order = compare(value, node.value)

  if (order <= 0) {
    return lessThan(node.left, value, compare)
  }

  return createNode(node.left, node.value, null)
}

export class Tree<T> {
  static empty<T>(compare: Comparer<T> = defaultComparer) {
    return new Tree<T>(null, compare)
  }

  root: TreeNode<T>
  compare: Comparer<T>

  constructor(root: TreeNode<T>, compare: Comparer<T>) {
    this.root = root
    this.compare = compare
  }

  insert(value: T): Tree<T> {
    return new Tree(insert(this.root, value, this.compare), this.compare)
  }

  ascending() {
    return traverseAsc(this.root)
  }

  lessThan(value: T): Tree<T> {
    if (this.root === null) {
      return this
    }

    return new Tree(lessThan(this.root, value, this.compare), this.compare)
  }

  [Symbol.iterator] = this.ascending
}
