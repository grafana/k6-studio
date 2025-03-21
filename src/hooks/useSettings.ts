import { useMutation, useQuery } from '@tanstack/react-query'

import { queryClient } from '@/utils/query'

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: window.studio.settings.getSettings,
  })
}

export function useSaveSettings(onSuccess?: () => void) {
  return useMutation({
    mutationFn: window.studio.settings.saveSettings,
    onSuccess: async (isSuccessful) => {
      if (!isSuccessful) {
        return
      }

      await queryClient.invalidateQueries({ queryKey: ['settings'] })
      onSuccess?.()
    },
    onError: (error) => {
      console.error('Error saving settings', error)
    },
  })
}

export function useBrowserCheck() {
  return useQuery({
    queryKey: ['settings', 'browserCheck'],
    queryFn: window.studio.ui.detectBrowser,
  })
}
