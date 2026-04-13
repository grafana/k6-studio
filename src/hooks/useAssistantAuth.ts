import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'

import { useStudioUIStore } from '@/store/ui'
import { queryClient } from '@/utils/query'

const QUERY_KEY = ['assistant-auth-status'] as const

export function invalidateAssistantAuthStatus() {
  return queryClient.invalidateQueries({ queryKey: QUERY_KEY })
}

export function useAssistantAuthStatus() {
  const isProfileOpen = useStudioUIStore((s) => s.isProfileDialogOpen)
  const wasOpen = useRef(false)

  useEffect(() => {
    if (wasOpen.current && !isProfileOpen) {
      void invalidateAssistantAuthStatus()
    }
    wasOpen.current = isProfileOpen
  }, [isProfileOpen])

  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: window.studio.ai.assistantGetStatus,
  })
}

export function useAssistantSignIn() {
  const [verificationCode, setVerificationCode] = useState<string | null>(null)

  useEffect(() => {
    return window.studio.ai.onAssistantVerificationCode(setVerificationCode)
  }, [])

  const mutation = useMutation({
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
        return invalidateAssistantAuthStatus()
      }
    },
    onSettled: () => {
      setVerificationCode(null)
    },
  })

  return {
    ...mutation,
    verificationCode,
    cancel: () => {
      mutation.reset()
      setVerificationCode(null)
      return window.studio.ai.assistantCancelSignIn()
    },
  }
}

export function useAssistantSignOut() {
  return useMutation({
    mutationFn: window.studio.ai.assistantSignOut,
    onSuccess: async () => {
      await invalidateAssistantAuthStatus()
    },
  })
}
