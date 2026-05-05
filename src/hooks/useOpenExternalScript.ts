import { useNavigate } from 'react-router-dom'

import { getViewPath } from '@/routeMap'

export function useOpenExternalScript() {
  const navigate = useNavigate()

  return async () => {
    const path = await window.studio.script.showScriptSelectDialog()
    if (!path) return
    navigate(getViewPath('script', path))
  }
}
