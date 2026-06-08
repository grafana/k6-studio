import { css } from '@emotion/react'
import { Box, Flex, ScrollArea, Text } from '@radix-ui/themes'
import { ChevronRightIcon } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ReplayerEvents } from 'rrweb'

import { useHighlightLocator } from '@/components/HighlightLocatorProvider'
import { usePlayerContext } from '@/components/SessionPlayer/PlayerContext'
import { DebuggerState } from '@/views/Validator/types'

interface SerializedNode {
  key: string
  nodeType: number
  tagName?: string
  attributes: Array<{ name: string; value: string }>
  children: SerializedNode[]
  textContent?: string
}

const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
])

const RRWEB_ATTR_PREFIX = /^(rr-|rr_|rrweb)/

function serializeNode(node: Node, path: string): SerializedNode | null {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.trim() ?? ''

    if (!text) {
      return null
    }

    return {
      key: path,
      nodeType: Node.TEXT_NODE,
      attributes: [],
      children: [],
      textContent: text.length > 200 ? text.slice(0, 200) + '…' : text,
    }
  }

  if (node.nodeType === Node.COMMENT_NODE) {
    const text = node.textContent?.trim() ?? ''

    if (!text) {
      return null
    }

    return {
      key: path,
      nodeType: Node.COMMENT_NODE,
      attributes: [],
      children: [],
      textContent: text.length > 200 ? text.slice(0, 200) + '…' : text,
    }
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null
  }

  const el = node as Element
  const tagName = el.tagName.toLowerCase()
  const attributes = Array.from(el.attributes)
    .filter((attr) => !RRWEB_ATTR_PREFIX.test(attr.name))
    .map((attr) => ({ name: attr.name, value: attr.value }))

  const children = Array.from(el.childNodes)
    .map((child, i) => serializeNode(child, `${path}/${i}`))
    .filter((n): n is SerializedNode => n !== null)

  return {
    key: path,
    nodeType: Node.ELEMENT_NODE,
    tagName,
    attributes,
    children,
  }
}

function resolveNodePath(root: Element, key: string): Element | null {
  const segments = key.split('/')
  let node: Node = root

  for (let i = 1; i < segments.length; i++) {
    const child = node.childNodes[parseInt(segments[i]!, 10)]
    if (!child) return null
    node = child
  }

  return node.nodeType === Node.ELEMENT_NODE ? (node as Element) : null
}

const nodeLineStyle = css`
  display: flex;
  align-items: baseline;
  padding: 1px 8px;
  cursor: default;
  white-space: nowrap;
  min-width: 0;
  font-family: monospace;
  font-size: 12px;
  line-height: 18px;
  user-select: text;

  &:hover {
    background: var(--gray-a3);
    border-radius: 4px;
  }
`

const clickableNodeLineStyle = css`
  cursor: pointer;
`

const tagNameStyle = css`
  color: var(--indigo-11);
`

const punctuationStyle = css`
  color: var(--gray-11);
`

const attrNameStyle = css`
  color: var(--amber-11);
`

const attrValueStyle = css`
  color: var(--orange-11);
`

const textNodeStyle = css`
  color: var(--gray-11);
`

const commentStyle = css`
  color: var(--green-11);
`

const ellipsisStyle = css`
  color: var(--gray-10);
  padding: 0 2px;
`

const chevronStyle = css`
  flex-shrink: 0;
  margin-right: 2px;
  color: var(--gray-9);
  position: relative;
  top: 2px;
`

interface DomNodeProps {
  node: SerializedNode
  depth: number
  expandedKeys: Set<string>
  onToggleExpand: (key: string) => void
  onHoverNode: (key: string | null) => void
}

function DomNode({
  node,
  depth,
  expandedKeys,
  onToggleExpand,
  onHoverNode,
}: DomNodeProps) {
  const isExpanded = expandedKeys.has(node.key)
  const hasChildren = node.children.length > 0
  const indent = depth * 16

  if (node.nodeType === Node.TEXT_NODE) {
    return (
      <div
        css={nodeLineStyle}
        style={{ paddingLeft: indent + 20 }}
        onMouseEnter={() => onHoverNode(null)}
      >
        <span css={textNodeStyle}>&quot;{node.textContent}&quot;</span>
      </div>
    )
  }

  if (node.nodeType === Node.COMMENT_NODE) {
    return (
      <div
        css={nodeLineStyle}
        style={{ paddingLeft: indent + 20 }}
        onMouseEnter={() => onHoverNode(null)}
      >
        <span css={commentStyle}>
          {'<!-- '}
          {node.textContent}
          {' -->'}
        </span>
      </div>
    )
  }

  const tagName = node.tagName ?? 'unknown'
  const isVoid = VOID_ELEMENTS.has(tagName)

  const openingTag = (
    <>
      <span css={punctuationStyle}>{'<'}</span>
      <span
        css={css`
          display: inline-flex;
          align-items: center;
          gap: 6px;
        `}
      >
        <span css={tagNameStyle}>{tagName}</span>
        {node.attributes.map((attr) => (
          <span key={attr.name}>
            <span css={attrNameStyle}>{attr.name}</span>
            {attr.value !== '' && (
              <>
                <span css={punctuationStyle}>{'="'}</span>
                <span css={attrValueStyle}>{attr.value}</span>
                <span css={punctuationStyle}>{'"'}</span>
              </>
            )}
          </span>
        ))}
      </span>
      <span css={punctuationStyle}>{'>'}</span>
    </>
  )

  const closingTag = (
    <>
      <span css={punctuationStyle}>{'</'}</span>
      <span css={tagNameStyle}>{tagName}</span>
      <span css={punctuationStyle}>{'>'}</span>
    </>
  )

  if (isVoid) {
    return (
      <div
        css={nodeLineStyle}
        style={{ paddingLeft: indent + 20 }}
        onMouseEnter={() => onHoverNode(node.key)}
      >
        {openingTag}
      </div>
    )
  }

  if (!hasChildren) {
    return (
      <div
        css={nodeLineStyle}
        style={{ paddingLeft: indent + 20 }}
        onMouseEnter={() => onHoverNode(node.key)}
      >
        {openingTag}
        {closingTag}
      </div>
    )
  }

  return (
    <div>
      <div
        css={[nodeLineStyle, clickableNodeLineStyle]}
        style={{ paddingLeft: indent + 4 }}
        onClick={() => onToggleExpand(node.key)}
        onMouseEnter={() => onHoverNode(node.key)}
      >
        <ChevronRightIcon
          style={{
            width: '12px',
            height: '12px',
            minWidth: '12px',
            minHeight: '12px',
          }}
          css={[
            chevronStyle,
            css`
              width: 12px;
              height: 12px;
              min-width: 12px;
              min-height: 12px;
              transform: ${isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'};
            `,
          ]}
        />
        {openingTag}
        {!isExpanded && (
          <>
            <span css={ellipsisStyle}>{'…'}</span>
            {closingTag}
          </>
        )}
      </div>
      {isExpanded && (
        <>
          {node.children.map((child) => (
            <DomNode
              key={child.key}
              node={child}
              depth={depth + 1}
              expandedKeys={expandedKeys}
              onToggleExpand={onToggleExpand}
              onHoverNode={onHoverNode}
            />
          ))}
          <div css={nodeLineStyle} style={{ paddingLeft: indent + 20 }}>
            {closingTag}
          </div>
        </>
      )}
    </div>
  )
}

interface HtmlInspectorProps {
  sessionState: DebuggerState
}

export function HtmlInspector({ sessionState }: HtmlInspectorProps) {
  const { player } = usePlayerContext()
  const setHighlightedLocator = useHighlightLocator()
  const [domRoot, setDomRoot] = useState<SerializedNode | null>(null)
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set())
  const updateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstDom = useRef(true)

  const serializeDom = useCallback(() => {
    const doc = player?.iframe?.contentDocument

    if (!doc?.documentElement) {
      return
    }

    const serialized = serializeNode(doc.documentElement, '0')

    setDomRoot(serialized)
  }, [player])

  // Auto-expand <html> and <body> the first time the DOM is available
  useEffect(() => {
    if (!domRoot || !isFirstDom.current) {
      return
    }

    isFirstDom.current = false

    const bodyKey = domRoot.children.find((c) => c.tagName === 'body')?.key
    const newExpanded = new Set<string>(['0'])

    if (bodyKey !== undefined) {
      newExpanded.add(bodyKey)
    }

    setExpandedKeys(newExpanded)
  }, [domRoot])

  useEffect(() => {
    if (!player) {
      setDomRoot(null)
      isFirstDom.current = true

      return
    }

    const scheduleUpdate = () => {
      if (updateTimerRef.current !== null) {
        clearTimeout(updateTimerRef.current)
      }

      updateTimerRef.current = setTimeout(() => {
        updateTimerRef.current = null
        serializeDom()
      }, 150)
    }

    const observer = new MutationObserver(scheduleUpdate)

    const attachObserver = () => {
      const doc = player.iframe?.contentDocument

      if (doc?.documentElement) {
        observer.observe(doc.documentElement, {
          childList: true,
          subtree: true,
          attributes: true,
          characterData: true,
        })
      }
    }

    const handleFullSnapshot = () => {
      observer.disconnect()

      setTimeout(() => {
        serializeDom()
        attachObserver()
      }, 0)
    }

    serializeDom()
    attachObserver()

    player.on(ReplayerEvents.FullsnapshotRebuilded, handleFullSnapshot)

    return () => {
      if (updateTimerRef.current !== null) {
        clearTimeout(updateTimerRef.current)
        updateTimerRef.current = null
      }

      observer.disconnect()
      player.off(ReplayerEvents.FullsnapshotRebuilded, handleFullSnapshot)
    }
  }, [player, serializeDom])

  const handleToggleExpand = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev)

      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }

      return next
    })
  }

  const handleHoverNode = useCallback(
    (key: string | null) => {
      if (key === null) {
        setHighlightedLocator(null)
        return
      }

      const doc = player?.iframe?.contentDocument
      if (!doc?.documentElement) return

      setHighlightedLocator(resolveNodePath(doc.documentElement, key))
    },
    [player, setHighlightedLocator]
  )

  const handleMouseLeave = useCallback(() => {
    setHighlightedLocator(null)
  }, [setHighlightedLocator])

  if (sessionState === 'pending') {
    return (
      <Flex align="center" justify="center" height="100%">
        <Text size="2" color="gray">
          Run the test to inspect the HTML.
        </Text>
      </Flex>
    )
  }

  if (domRoot === null) {
    return (
      <Flex align="center" justify="center" height="100%">
        <Text size="2" color="gray">
          Waiting for the page…
        </Text>
      </Flex>
    )
  }

  return (
    <ScrollArea
      css={css`
        height: 100%;
      `}
      onMouseLeave={handleMouseLeave}
    >
      <Box p="1">
        <DomNode
          node={domRoot}
          depth={0}
          expandedKeys={expandedKeys}
          onToggleExpand={handleToggleExpand}
          onHoverNode={handleHoverNode}
        />
      </Box>
    </ScrollArea>
  )
}
