import { useCreateBrowserTest } from '@/hooks/useCreateBrowserTest'
import { useCreateGenerator } from '@/hooks/useCreateGenerator'
import { useFeaturesStore } from '@/store/features'

export function useCreateTestActions() {
  const handleCreateHTTPTest = useCreateGenerator()
  const handleCreateBrowserTest = useCreateBrowserTest()
  const isBrowserEditorEnabled = useFeaturesStore(
    (state) => state.features['browser-test-editor']
  )

  return {
    handleCreateHTTPTest,
    handleCreateBrowserTest,
    isBrowserEditorEnabled,
  }
}
