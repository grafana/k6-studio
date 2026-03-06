import { useQuery } from '@tanstack/react-query'

export function useDataFilePreview(filePath: string) {
  return useQuery({
    queryKey: ['data-file', filePath],
    queryFn: async () => {
      const data = await window.studio.file.open(filePath)

      if (data.type !== 'json' && data.type !== 'csv') {
        throw new Error('Unsupported file format')
      }

      return data
    },
    enabled: !!filePath,
  })
}
