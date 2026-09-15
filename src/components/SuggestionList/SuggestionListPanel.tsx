import { Box } from '@radix-ui/themes'
import { Children, ReactNode } from 'react'

interface SuggestionListPanelProps {
  children: ReactNode
}

/**
 * Bordered panel that wraps a flat list of SuggestionRow items. Renders
 * nothing for an empty list, since an empty bordered box collapses into a
 * stray horizontal line.
 */
export function SuggestionListPanel({ children }: SuggestionListPanelProps) {
  if (Children.toArray(children).length === 0) {
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
      {children}
    </Box>
  )
}
