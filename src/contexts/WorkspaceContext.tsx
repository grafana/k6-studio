import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import type { Workspace } from '@/types/workspace'

const WorkspaceContext = createContext<Workspace | null>(null)

interface WorkspaceProviderProps {
  children: ReactNode
}

export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null)

  useEffect(() => {
    window.studio.workspace
      .getWorkspace()
      .then((workspaceData) => {
        setWorkspace(workspaceData)

        window.studio.app.closeSplashscreen()
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    return window.studio.workspace.onChangeWorkspace(() => {
      void window.studio.workspace.getWorkspace().then(setWorkspace)
    })
  }, [])

  return (
    <WorkspaceContext.Provider value={workspace}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace(): Workspace | null {
  return useContext(WorkspaceContext)
}
