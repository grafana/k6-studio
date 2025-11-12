import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import invariant from 'tiny-invariant'

export function useScriptPath() {
  const { fileName } = useParams()

  invariant(fileName, 'fileName param is required')

  return fileName
}

export function useScript(fileName: string) {
  invariant(fileName, 'fileName param is required')

  return useQuery({
    queryKey: ['script', fileName],
    queryFn: async () => {
      return window.studio.script.openScript(fileName)
    },
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    staleTime: 0,
  })
}
