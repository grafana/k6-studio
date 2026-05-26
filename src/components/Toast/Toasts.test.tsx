import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useToastStore } from '@/store/ui/useToast'
import { AddToastPayload } from '@/types/toast'

import { Toasts } from './Toasts'

describe('Toasts', () => {
  let emitToast: (toast: AddToastPayload) => void

  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('studio', {
      ui: {
        onToast: (callback: (toast: AddToastPayload) => void) => {
          emitToast = callback
          return vi.fn()
        },
      },
    })
  })

  afterEach(() => {
    useToastStore.setState({ toasts: [], providerResetKey: 0 })
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('auto-dismisses a toast added after a paused toast is dismissed', async () => {
    render(<Toasts />)

    act(() => {
      emitToast({ title: 'Paused toast' })
    })

    fireEvent.pointerMove(screen.getByLabelText(/notifications/i))
    fireEvent.click(screen.getByRole('button', { hidden: true }))

    act(() => {
      emitToast({ title: 'Next toast' })
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(6000)
    })

    expect(screen.queryByText('Next toast')).toBeNull()
  })

  it('marks a toast closed before calling onDismiss', () => {
    const onDismiss = vi.fn(() => {
      expect(useToastStore.getState().toasts.at(0)).toMatchObject({
        title: 'Dismissable toast',
        open: false,
      })
    })

    render(<Toasts />)

    act(() => {
      emitToast({ title: 'Dismissable toast', onDismiss })
    })

    fireEvent.click(screen.getByRole('button', { hidden: true }))

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })
})
