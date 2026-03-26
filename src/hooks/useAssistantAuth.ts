import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

import { useStudioUIStore } from '@/store/ui'
import { queryClient } from '@/utils/query'

const QUERY_KEY = ['assistant-auth-status'] as const

export function useAssistantAuthStatus() {
  const qc = useQueryClient()
  const isProfileOpen = useStudioUIStore((s) => s.isProfileDialogOpen)
  const wasOpen = useRef(false)

  useEffect(() => {
    if (wasOpen.current && !isProfileOpen) {
      void qc.invalidateQueries({ queryKey: QUERY_KEY })
    }
    wasOpen.current = isProfileOpen
  }, [isProfileOpen, qc])

  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: window.studio.ai.assistantGetStatus,
  })
}

export function useAssistantSignIn() {
  return useMutation({
    mutationFn: async () => {
      const result = await window.studio.ai.assistantSignIn()

      if (result.type === 'error') {
        throw new Error(
          result.error ?? 'Failed to connect to Grafana Assistant'
        )
      }

      return result
    },
    onSuccess: (result) => {
      if (result.type === 'authenticated') {
        return queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      }
    },
  })
}

export function cancelAssistantSignIn() {
  return window.studio.ai.assistantCancelSignIn()
}

export function useAssistantSignOut() {
  return useMutation({
    mutationFn: window.studio.ai.assistantSignOut,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEY,
      })
    },
  })
}
