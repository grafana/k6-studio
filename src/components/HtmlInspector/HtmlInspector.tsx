import { css } from '@emotion/react'
import { Box, Flex, ScrollArea, Text } from '@radix-ui/themes'
import { ChevronRightIcon } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Replayer, ReplayerEvents } from 'rrweb'

import { useHighlightLocator } from '@/components/HighlightLocatorProvider'
import { usePlayerContext } from '@/components/SessionPlayer/PlayerContext'
import { safeParseReplayEvent } from '@/main/runner/rrweb'
import { DebuggerState } from '@/views/Validator/types'

import {
  serializeNode,
  type SerializedAttribute,
  type SerializedElement,
  type SerializedNode,
} from './HtmlInspector.utils'

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

const NULL_PAGE_ID = 'NO_PAGE_ID'

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

interface OpenTagProps {
  tagName: string
  attributes: SerializedAttribute[]
}

function OpenTag({ tagName, attributes }: OpenTagProps) {
  return (
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
        {attributes.map((attr) => (
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
}

interface CloseTagProps {
  tagName: string
}

function CloseTag({ tagName }: CloseTagProps) {
  return (
    <>
      <span css={punctuationStyle}>{'</'}</span>
      <span css={tagNameStyle}>{tagName}</span>
      <span css={punctuationStyle}>{'>'}</span>
    </>
  )
}

interface DomNodeProps {
  node: SerializedNode
  depth: number
  expandedKeys: Set<string>
  onToggleExpand: (key: string) => void
  onHoverNode: (node: SerializedElement | null) => void
}

function DomNode({
  node,
  depth,
  expandedKeys,
  onToggleExpand,
  onHoverNode,
}: DomNodeProps) {
  const indent = depth * 16

  if (node.type === Node.TEXT_NODE) {
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

  if (node.type === Node.COMMENT_NODE) {
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

  const isExpanded = expandedKeys.has(node.key)
  const hasChildren = node.children.length > 0

  const tagName = node.tagName ?? 'unknown'
  const isVoid = VOID_ELEMENTS.has(tagName)

  if (isVoid) {
    return (
      <div
        css={nodeLineStyle}
        style={{ paddingLeft: indent + 20 }}
        onMouseEnter={() => onHoverNode(node)}
      >
        <OpenTag tagName={tagName} attributes={node.attributes} />
      </div>
    )
  }

  if (!hasChildren) {
    return (
      <div
        css={nodeLineStyle}
        style={{ paddingLeft: indent + 20 }}
        onMouseEnter={() => onHoverNode(node)}
      >
        <OpenTag tagName={tagName} attributes={node.attributes} />
        <CloseTag tagName={tagName} />
      </div>
    )
  }

  return (
    <div>
      <div
        css={[nodeLineStyle, clickableNodeLineStyle]}
        style={{ paddingLeft: indent + 4 }}
        onClick={() => onToggleExpand(node.key)}
        onMouseEnter={() => onHoverNode(node)}
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
        <OpenTag tagName={tagName} attributes={node.attributes} />
        {!isExpanded && (
          <>
            <span css={ellipsisStyle}>{'…'}</span>
            <CloseTag tagName={tagName} />
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
            <CloseTag tagName={tagName} />
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
  const fullSnapshotTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  )
  const isFirstDom = useRef(true)
  const currentPageIdRef = useRef<string>(NULL_PAGE_ID)
  const shouldAutoExpandRef = useRef(false)

  const expandDefaultNodes = useCallback((domRoot: SerializedNode) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev)

      if (domRoot.type === Node.ELEMENT_NODE) {
        next.add(domRoot.key)

        const bodyNode = domRoot.children.find(
          (child) =>
            child.type === Node.ELEMENT_NODE && child.tagName === 'body'
        )

        if (bodyNode !== undefined) {
          next.add(bodyNode.key)
        }
      }

      return next
    })
  }, [])

  const serializeDom = useCallback(
    (player: Replayer, autoExpand = false) => {
      const pageId = currentPageIdRef.current
      const documentElement = player.iframe.contentDocument?.documentElement

      if (documentElement === undefined) {
        return
      }

      const rootNode = serializeNode(player, documentElement, pageId)

      setDomRoot(rootNode)

      if (rootNode?.type === Node.ELEMENT_NODE && autoExpand) {
        expandDefaultNodes(rootNode)
      }
    },
    [expandDefaultNodes]
  )

  useEffect(() => {
    if (!player) {
      setDomRoot(null)

      isFirstDom.current = true
      currentPageIdRef.current = NULL_PAGE_ID

      return
    }

    isFirstDom.current = false

    const scheduleUpdate = () => {
      if (updateTimerRef.current !== null) {
        clearTimeout(updateTimerRef.current)
      }

      updateTimerRef.current = setTimeout(() => {
        updateTimerRef.current = null
        serializeDom(player)
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

      if (fullSnapshotTimerRef.current !== null) {
        clearTimeout(fullSnapshotTimerRef.current)
      }

      fullSnapshotTimerRef.current = setTimeout(() => {
        fullSnapshotTimerRef.current = null
        const autoExpand = shouldAutoExpandRef.current
        shouldAutoExpandRef.current = false
        serializeDom(player, autoExpand)
        attachObserver()
      }, 0)
    }

    const handleCustomEvent = (event: unknown) => {
      const { data } = safeParseReplayEvent(event)

      if (data?.data.tag !== 'page-start') {
        return
      }

      shouldAutoExpandRef.current = true
      currentPageIdRef.current = data.data.payload.pageId ?? NULL_PAGE_ID
    }

    serializeDom(player, true)
    attachObserver()

    player.on(ReplayerEvents.FullsnapshotRebuilded, handleFullSnapshot)
    player.on(ReplayerEvents.CustomEvent, handleCustomEvent)

    return () => {
      if (updateTimerRef.current !== null) {
        clearTimeout(updateTimerRef.current)
        updateTimerRef.current = null
      }

      if (fullSnapshotTimerRef.current !== null) {
        clearTimeout(fullSnapshotTimerRef.current)
        fullSnapshotTimerRef.current = null
      }

      observer.disconnect()
      player.off(ReplayerEvents.FullsnapshotRebuilded, handleFullSnapshot)
      player.off(ReplayerEvents.CustomEvent, handleCustomEvent)
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
    (target: SerializedElement | null) => {
      if (target === null) {
        setHighlightedLocator(null)

        return
      }

      const doc = player?.iframe?.contentDocument

      if (!doc?.documentElement) {
        return
      }

      setHighlightedLocator(target.node)
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
