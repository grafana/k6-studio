import { useQuery } from '@tanstack/react-query'

export function useFileExists(filePath: string) {
  return useQuery({
    queryKey: ['file-exists', filePath],
    queryFn: () => window.studio.fs.fileExists(filePath),
  })
}
