import { useQuery } from '@tanstack/react-query'

export function useDataFilePreview(filePath: string) {
  return useQuery({
    queryKey: ['data-file', filePath],
    queryFn: () => window.studio.data.loadPreview(filePath),
    enabled: !!filePath,
  })
}
