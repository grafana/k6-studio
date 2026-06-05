import { useQuery } from '@tanstack/react-query'

export function useFileExists(filePath: string, defaultValue = true) {
  const { data = defaultValue } = useQuery({
    queryKey: ['file-exists', filePath],
    queryFn: () => window.studio.fs.fileExists(filePath),
    staleTime: 1000 * 60, // 1 minute
  })

  return data
}
