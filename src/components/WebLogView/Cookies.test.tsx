import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Cookies } from './Cookies'

describe('Cookies', () => {
  it('replaces duplicate cookie rows when selecting another response', () => {
    const { rerender } = render(
      <Cookies
        cookies={[
          ['dup', 'root'],
          ['dup', 'app'],
        ]}
      />
    )

    expect(screen.getAllByText('dup')).toHaveLength(2)
    expect(screen.getByText('root')).toBeDefined()
    expect(screen.getByText('app')).toBeDefined()

    rerender(<Cookies cookies={[['sid', '']]} />)

    expect(screen.getByText('sid')).toBeDefined()
    expect(screen.queryByText('dup')).toBeNull()
    expect(screen.queryByText('root')).toBeNull()
    expect(screen.queryByText('app')).toBeNull()
  })
})
