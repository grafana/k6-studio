import { useQuery } from '@tanstack/react-query'

export function useFileExists(filePath: string, defaultValue = false) {
  const { data = defaultValue } = useQuery({
    queryKey: ['file-exists', filePath],
    queryFn: () => window.studio.fs.fileExists(filePath),
  })

  return data
}
