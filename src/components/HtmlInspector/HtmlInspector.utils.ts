import { Replayer } from 'rrweb'

interface SerializedNodeBase {
  key: string
  node: Node
}

interface SerializedText extends SerializedNodeBase {
  type: typeof Node.TEXT_NODE
  textContent: string
  node: Text
}

interface SerializedComment extends SerializedNodeBase {
  type: typeof Node.COMMENT_NODE
  textContent: string
  node: Comment
}

export interface SerializedAttribute {
  name: string
  value: string
}

export interface SerializedElement extends SerializedNodeBase {
  type: typeof Node.ELEMENT_NODE
  tagName: string
  attributes: SerializedAttribute[]
  children: SerializedNode[]
  node: Element
}

export type SerializedNode =
  | SerializedText
  | SerializedComment
  | SerializedElement

const RRWEB_ATTR_PREFIX = /^(rr-|rr_|rrweb)/

export function serializeNode(
  player: Replayer,
  node: Node,
  pageId: string
): SerializedNode | null {
  const key = `${pageId}:${player.getMirror().getId(node)}`

  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.trim() ?? ''

    if (!text) {
      return null
    }

    return {
      key,
      type: Node.TEXT_NODE,
      node: node as Text,
      textContent: text.length > 200 ? text.slice(0, 200) + '…' : text,
    }
  }

  if (node.nodeType === Node.COMMENT_NODE) {
    const text = node.textContent?.trim() ?? ''

    if (!text) {
      return null
    }

    return {
      key,
      type: Node.COMMENT_NODE,
      node: node as Comment,
      textContent: text.length > 200 ? text.slice(0, 200) + '…' : text,
    }
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null
  }

  const element = node as Element

  const tagName = element.tagName.toLowerCase()
  const attributes = Array.from(element.attributes)
    .filter((attr) => !RRWEB_ATTR_PREFIX.test(attr.name))
    .flatMap((attr) => {
      // rrweb adds the classes `rrweb-paused` when the recording is paused and `:hover` to simulate elements
      // being hovered, so we want to hide these from the inspector. We don't want to do string manipulations
      // on every class attribute in the DOM, so we check if these classes are present. By using `classList`
      // we can (presumably) get constant time lookup instead of doing a linear string search.
      if (
        attr.name === 'class' &&
        (element.classList.contains('rrweb-paused') ||
          element.classList.contains(':hover'))
      ) {
        const value = attr.value
          .split(/\s+/)
          .filter((cls) => cls !== 'rrweb-paused' && cls !== ':hover')
          .join(' ')

        if (value === '') {
          return []
        }

        return {
          name: attr.name,
          value,
        }
      }

      return { name: attr.name, value: attr.value }
    })

  const children = Array.from(element.childNodes)
    .map((child) => serializeNode(player, child, pageId))
    .filter((n) => n !== null)

  return {
    key,
    type: Node.ELEMENT_NODE,
    node: element,
    tagName,
    attributes,
    children,
  }
}
