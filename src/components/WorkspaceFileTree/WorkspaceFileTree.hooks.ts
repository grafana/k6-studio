import { useCallback, useMemo, useRef, useState } from 'react'

type NodeId = string | number | symbol

export interface UseTreeOptions<T> {
  /** Root node of the tree */
  root: T
  /** All nodes in the tree, indexed by their parent id */
  nodes: Record<NodeId, T[] | null>
  /** Unique identifier for each node */
  getId: (item: T) => NodeId
  /** Whether the node can be expanded. Defaults to checking if item has directory-like structure */
  isFolder: (item: T) => boolean
  /** Called when a folder is expanded. Use to fetch children asynchronously */
  onExpand?: (item: T) => Promise<void> | void
  /** Called when a folder is collapsed */
  onCollapse?: (item: T) => Promise<void> | void
}

export interface TreeItem<T> {
  /** The node data */
  node: T
  /** Nesting level (0 for root) */
  level: number
  /** Whether the node is expanded */
  expanded: boolean
  /** True if children are being loaded (expanded but getChildren returns empty) */
  isLoading: boolean
  /** Toggle expand/collapse state */
  toggle: (expanded?: boolean) => Promise<void> | void
  /** ARIA and DOM props to spread on the treeitem element */
  props: {
    aria: {
      role: 'treeitem'
      tabIndex: number
      'aria-expanded'?: boolean
      'aria-level': number
      'aria-posinset': number
      'aria-setsize': number
    }
    control: {
      ref: (element: HTMLElement | null) => void
      onKeyDown: (event: React.KeyboardEvent) => void
    }
  }
}

function buildTree<T>(
  root: T,
  nodes: Record<NodeId, T[] | null>,
  expandedIds: Set<NodeId>,
  getId: UseTreeOptions<T>['getId'],
  isFolder: UseTreeOptions<T>['isFolder']
) {
  const result: Array<{
    item: T
    level: number
    posInSet: number
    setSize: number
  }> = []

  function traverse(parents: T[], item: T) {
    const id = getId(item)

    if (!isFolder(item) || !expandedIds.has(id)) {
      return
    }

    const children = nodes[id] ?? null

    if (children === null) {
      return
    }

    const newParents = [...parents, item]

    for (let i = 0; i < children.length; i++) {
      const child = children[i]

      if (child === undefined) {
        continue
      }

      result.push({
        item: child,
        level: newParents.length,
        posInSet: i + 1,
        setSize: children.length,
      })

      traverse(newParents, child)
    }
  }

  traverse([], root)

  return result
}

export function useTree<T>(options: UseTreeOptions<T>) {
  const { root, nodes, getId, isFolder, onExpand, onCollapse } = options

  const [expandedIds, setExpandedIds] = useState<Set<NodeId>>(
    new Set([getId(root)])
  )

  const [focusedId, setFocusedId] = useState<NodeId | null>(null)
  const itemRefsMap = useRef<Map<NodeId, HTMLElement>>(new Map())

  const focusItem = useCallback((id: NodeId) => {
    setFocusedId(id)

    itemRefsMap.current.get(id)?.focus()
  }, [])

  const registerItemRef = useCallback(
    (id: NodeId, element: HTMLElement | null) => {
      if (element === null) {
        itemRefsMap.current.delete(id)

        return
      }

      itemRefsMap.current.set(id, element)
    },
    []
  )

  const toggle = useCallback(
    (item: T, expanded?: boolean) => {
      const id = getId(item)

      if (!isFolder(item)) {
        return
      }

      const shouldExpand = expanded ?? !expandedIds.has(id)

      if (shouldExpand) {
        setExpandedIds((prev) => {
          const next = new Set(prev)
          next.add(id)
          return next
        })

        return onExpand?.(item)
      }

      setExpandedIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })

      return onCollapse?.(item)
    },
    [expandedIds, getId, isFolder, onExpand, onCollapse]
  )

  const flatItems = useMemo(() => {
    return buildTree(root, nodes, expandedIds, getId, isFolder)
  }, [root, expandedIds, nodes, getId, isFolder])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, currentItem: T, currentIndex: number) => {
      const id = getId(currentItem)
      const children = nodes[id] ?? null
      const isFolderItem = isFolder(currentItem)
      const isExpanded = expandedIds.has(id)
      const isRoot = currentIndex === 0

      const firstChild = children?.[0]

      const hasVisibleChildren =
        isFolderItem && isExpanded && firstChild !== undefined

      switch (event.key) {
        case 'ArrowRight': {
          event.preventDefault()

          if (!isFolderItem) {
            break
          }

          if (isExpanded && hasVisibleChildren) {
            focusItem(getId(firstChild))

            break
          }

          if (!isExpanded) {
            void toggle(currentItem)

            break
          }

          break
        }

        case 'ArrowLeft': {
          event.preventDefault()
          if (isFolderItem && isExpanded) {
            void toggle(currentItem)

            break
          }

          if (!isRoot) {
            const currentLevel = flatItems[currentIndex]!.level

            for (let i = currentIndex - 1; i >= 0; i--) {
              if (flatItems[i]!.level < currentLevel) {
                focusItem(getId(flatItems[i]!.item))

                break
              }
            }
          }

          break
        }

        case 'ArrowDown': {
          event.preventDefault()

          if (currentIndex < flatItems.length - 1) {
            focusItem(getId(flatItems[currentIndex + 1]!.item))
          }

          break
        }

        case 'ArrowUp': {
          event.preventDefault()

          if (currentIndex > 0) {
            focusItem(getId(flatItems[currentIndex - 1]!.item))
          }

          break
        }

        case 'Home': {
          event.preventDefault()

          if (flatItems.length > 0) {
            focusItem(getId(flatItems[0]!.item))
          }

          break
        }

        case 'End': {
          event.preventDefault()

          if (flatItems.length > 0) {
            focusItem(getId(flatItems[flatItems.length - 1]!.item))
          }

          break
        }

        case 'Enter':
        case ' ': {
          event.preventDefault()

          if (isFolderItem) {
            void toggle(currentItem)
          }

          break
        }
      }
    },
    [expandedIds, flatItems, nodes, focusItem, getId, isFolder, toggle]
  )

  const items: Array<TreeItem<T>> = useMemo(() => {
    return flatItems.map(({ item, level, posInSet, setSize }, index) => {
      const id = getId(item)

      const children = nodes[id] ?? null
      const isFolderItem = isFolder(item)
      const isExpanded = expandedIds.has(id)

      const isLoading = isFolderItem && isExpanded && children === null

      const props: TreeItem<T>['props'] = {
        control: {
          ref: (el) => registerItemRef(id, el),
          onKeyDown: (e) => {
            if (e.defaultPrevented) {
              return
            }

            handleKeyDown(e, item, index)
          },
        },
        aria: {
          role: 'treeitem',
          tabIndex: focusedId === id ? 0 : -1,
          'aria-level': level + 1,
          'aria-posinset': posInSet,
          'aria-setsize': setSize,
          'aria-expanded': isFolderItem ? isExpanded : undefined,
        },
      }

      return {
        node: item,
        level,
        expanded: isExpanded,
        isLoading,
        props,
        toggle: (expanded) => toggle(item, expanded),
      }
    })
  }, [
    nodes,
    flatItems,
    expandedIds,
    focusedId,
    getId,
    isFolder,
    handleKeyDown,
    registerItemRef,
    toggle,
  ])

  const handleContainerFocus = useCallback(() => {
    if (focusedId === null && flatItems.length > 0) {
      focusItem(getId(flatItems[0]!.item))
    }
  }, [flatItems, focusItem, focusedId, getId])

  return {
    items,
    props: {
      role: 'tree' as const,
      tabIndex: 0,
      onFocus: handleContainerFocus,
    },
  }
}
