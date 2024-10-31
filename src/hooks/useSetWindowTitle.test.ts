import { renderHook } from '@testing-library/react'
import { useSetWindowTitle } from './useSetWindowTitle'
import { beforeEach, describe, expect, it } from 'vitest'

describe('useSetWindowTitle', () => {
  const defaultTitle = 'k6 Studio (public preview)'

  beforeEach(() => {
    document.title = defaultTitle
  })

  it('should set the document title on mount', () => {
    const title = 'Test Title'
    renderHook(() => useSetWindowTitle(title))

    expect(document.title).toBe(`${defaultTitle} - ${title}`)
  })

  it('should reset the document title on unmount', () => {
    const title = 'Test Title'
    const { unmount } = renderHook(() => useSetWindowTitle(title))

    unmount()

    expect(document.title).toBe(defaultTitle)
  })

  it('should update the document title when the title changes', () => {
    const initialTitle = 'Initial Title'
    const updatedTitle = 'Updated Title'
    const { rerender } = renderHook(({ title }) => useSetWindowTitle(title), {
      initialProps: { title: initialTitle },
    })

    expect(document.title).toBe(`${defaultTitle} - ${initialTitle}`)

    rerender({ title: updatedTitle })

    expect(document.title).toBe(`${defaultTitle} - ${updatedTitle}`)
  })
})
