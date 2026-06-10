import { Box, Button, Flex } from '@radix-ui/themes'
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react'
import { useState } from 'react'

import { ActionsLog } from '@/components/Assistant/ActionsLog'
import { ActionLogEntry } from '@/components/Assistant/types'

interface CollapsedLogProps {
  entries: ActionLogEntry[]
}

/**
 * The analysis log of a completed step, collapsed by default but still
 * available for review.
 */
export function CollapsedLog({ entries }: CollapsedLogProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (entries.length === 0) {
    return null
  }

  return (
    <Box
      css={{
        border: '1px solid var(--gray-4)',
        borderRadius: 'var(--radius-3)',
        overflow: 'hidden',
      }}
    >
      <Flex p="1">
        <Button
          variant="ghost"
          color="gray"
          size="1"
          m="1"
          onClick={() => setIsOpen((previous) => !previous)}
        >
          {isOpen ? (
            <ChevronDownIcon size={14} />
          ) : (
            <ChevronRightIcon size={14} />
          )}
          Analysis log ({entries.length} entries)
        </Button>
      </Flex>
      {isOpen && (
        <Box css={{ height: 240, borderTop: '1px solid var(--gray-4)' }}>
          <ActionsLog entries={entries} />
        </Box>
      )}
    </Box>
  )
}
