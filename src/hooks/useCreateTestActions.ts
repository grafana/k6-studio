import { useCreateBrowserTest } from '@/hooks/useCreateBrowserTest'
import { useCreateGenerator } from '@/hooks/useCreateGenerator'

export function useCreateTestActions() {
  const handleCreateHTTPTest = useCreateGenerator()
  const handleCreateBrowserTest = useCreateBrowserTest()

  return {
    handleCreateHTTPTest,
    handleCreateBrowserTest,
  }
}
