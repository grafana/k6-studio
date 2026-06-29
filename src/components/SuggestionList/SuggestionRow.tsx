import { Box, Flex, Text } from '@radix-ui/themes'
import { ChevronDownIcon } from 'lucide-react'
import { ReactNode, useState } from 'react'

const MONO = 'var(--code-font-family)'

interface SuggestionRowProps {
  /** Leading type icon, rendered in the accent color. */
  icon?: ReactNode
  /** Primary label (bold monospace). */
  name: ReactNode
  /** Muted secondary detail shown next to the name. */
  secondary?: ReactNode
  /** Right-aligned controls (toggle, remove, value editor). */
  controls?: ReactNode
  /** When set, the row gains an expand chevron revealing this content. */
  expandableContent?: ReactNode
  defaultExpanded?: boolean
  /** Omits the bottom divider on the last row of a panel. */
  isLast?: boolean
  /** Dims the row (e.g. a disabled rule). */
  dimmed?: boolean
}

export function SuggestionRow({
  icon,
  name,
  secondary,
  controls,
  expandableContent,
  defaultExpanded = false,
  isLast = false,
  dimmed = false,
}: SuggestionRowProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const isExpandable = expandableContent !== undefined

  return (
    <Box
      css={{
        borderBottom: isLast ? 'none' : '1px solid var(--gray-3)',
        opacity: dimmed ? 0.45 : 1,
        transition: 'opacity .15s, background .12s',
        '&:hover': { background: 'var(--gray-1)' },
      }}
    >
      <Flex align="center" gap="3" css={{ padding: '10px 16px' }}>
        <Flex
          align="center"
          gap="3"
          css={{
            flex: 1,
            minWidth: 0,
            cursor: isExpandable ? 'pointer' : 'default',
          }}
          onClick={
            isExpandable ? () => setExpanded((prev) => !prev) : undefined
          }
        >
          {isExpandable && (
            <ChevronDownIcon
              size={14}
              css={{
                flexShrink: 0,
                color: 'var(--gray-9)',
                transition: 'transform 150ms',
                transform: expanded ? undefined : 'rotate(-90deg)',
              }}
            />
          )}
          {icon && (
            <Text
              color="orange"
              asChild
              css={{ flexShrink: 0, display: 'flex' }}
            >
              {icon}
            </Text>
          )}
          <Text
            css={{
              flexShrink: 0,
              fontFamily: MONO,
              fontSize: 13,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {name}
          </Text>
          {secondary && (
            <Flex
              align="center"
              gap="2"
              css={{
                flex: 1,
                minWidth: 0,
                color: 'var(--gray-10)',
                fontFamily: MONO,
                fontSize: 12,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {secondary}
            </Flex>
          )}
        </Flex>
        {controls && (
          <Flex align="center" gap="3" css={{ flexShrink: 0 }}>
            {controls}
          </Flex>
        )}
      </Flex>

      {isExpandable && expanded && (
        <Box css={{ padding: '0 16px 12px', paddingLeft: 49 }}>
          {expandableContent}
        </Box>
      )}
    </Box>
  )
}
