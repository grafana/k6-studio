import { useQuery } from '@tanstack/react-query'

export function useDataFilePreview(fileName: string) {
  return useQuery({
    queryKey: ['data-file', fileName],
    queryFn: () => window.studio.data.loadPreview(fileName),
    enabled: !!fileName,
  })
}
