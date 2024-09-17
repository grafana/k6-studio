import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // No need to retry file read/write operations
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
})
