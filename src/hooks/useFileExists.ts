import { useQuery } from '@tanstack/react-query'

export function useFileExists(filePath: string) {
  const {
    isSuccess,
    isError,
    data: exists,
  } = useQuery({
    queryKey: ['file-exists', filePath],
    queryFn: () => window.studio.fs.fileExists(filePath),
  })

  if (isSuccess) {
    return exists ? 'exists' : 'missing'
  }

  if (isError) {
    return 'error'
  }

  return 'loading'
}
