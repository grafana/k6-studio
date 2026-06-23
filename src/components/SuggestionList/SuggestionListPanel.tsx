import { Box } from '@radix-ui/themes'
import { ReactNode } from 'react'

interface SuggestionListPanelProps {
  children: ReactNode
}

/** Bordered panel that wraps a flat list of SuggestionRow items. */
export function SuggestionListPanel({ children }: SuggestionListPanelProps) {
  return (
    <Box
      css={{
        border: '1px solid var(--gray-4)',
        borderRadius: 'var(--radius-3)',
        overflow: 'hidden',
      }}
    >
      {children}
    </Box>
  )
}
