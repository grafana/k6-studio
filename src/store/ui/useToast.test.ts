import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useToastStore } from './useToast'

describe('useToastStore', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [], providerResetKey: 0 })
  })

  it('drops closed toasts when resetting the provider for the next toast', () => {
    useToastStore.getState().add({ title: 'Closed toast', status: 'default' })
    const closedToastId = useToastStore.getState().toasts.at(0)!.id

    useToastStore.getState().dismiss(closedToastId)
    useToastStore.getState().add({ title: 'Next toast', status: 'default' })

    expect(useToastStore.getState().toasts).toMatchObject([
      { title: 'Next toast', open: true },
    ])
  })

  it('does not notify subscribers when removing an unknown toast', () => {
    const listener = vi.fn()
    const unsubscribe = useToastStore.subscribe(listener)

    useToastStore.getState().remove('missing-toast-id')
    unsubscribe()

    expect(listener).not.toHaveBeenCalled()
  })
})
