import { useLocation, useParams } from 'react-router-dom'

export function useScriptPath() {
  const { fileName } = useParams()
  const { state } = useLocation()

  return {
    scriptPath: fileName || state?.externalScriptPath,
    isExternal: Boolean(state?.externalScriptPath),
  }
}
