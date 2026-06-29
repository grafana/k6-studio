import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SimpleMarkdown } from './SimpleMarkdown'

describe('SimpleMarkdown', () => {
  it('keeps the bullet and content of loose list items on one row', () => {
    // Blank lines between items make this a "loose" list, where markdown
    // wraps each item's content in a paragraph.
    render(
      <SimpleMarkdown
        text={
          'Hosts:\n\n- **first.example.com** - keep\n\n- second.example.com'
        }
      />
    )

    const item = screen.getByText('first.example.com')
    const row = item.closest('.rt-Flex')

    expect(row).not.toBeNull()
    expect(row?.textContent?.replace(/\s+/g, ' ').trim()).toBe(
      '- first.example.com - keep'
    )
  })

  it('renders tight list items with their bullet', () => {
    render(<SimpleMarkdown text={'- one\n- two'} />)

    expect(screen.getByText('one').closest('.rt-Flex')?.textContent).toBe(
      '-one'
    )
    expect(screen.getByText('two').closest('.rt-Flex')?.textContent).toBe(
      '-two'
    )
  })
})
