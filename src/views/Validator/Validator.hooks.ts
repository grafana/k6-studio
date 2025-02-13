import { useLocation, useParams } from 'react-router-dom'

export function useScriptPath() {
  const { fileName } = useParams()
  // TODO(router): useLocation is not type-safe. Refactor this route to avoid using it.
  const { state } = useLocation() as { state: { externalScriptPath: string } }

  return {
    scriptPath: state?.externalScriptPath ? state.externalScriptPath : fileName,
    isExternal: Boolean(state?.externalScriptPath),
  }
}
