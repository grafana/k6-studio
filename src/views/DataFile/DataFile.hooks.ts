import { useQuery } from '@tanstack/react-query'

export function useDataFilePreview(fileName: string) {
  return useQuery({
    queryKey: ['data-file', fileName],
    queryFn: async () => {
      const content = await window.studio.fs.openFile(fileName)

      if (content.type !== 'data-file') {
        throw new Error(`Expected data-file content, got ${content.type}`)
      }

      return content.data
    },
    enabled: !!fileName,
  })
}
