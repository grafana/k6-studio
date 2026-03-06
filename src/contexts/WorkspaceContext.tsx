import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

interface WorkspaceContextValue {
  workspacePath: string | null
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

interface WorkspaceProviderProps {
  children: ReactNode
}

export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  const [workspacePath, setWorkspacePath] = useState<string | null>(null)

  useEffect(() => {
    window.studio.workspace
      .getWorkspacePath()
      .then((path) => {
        setWorkspacePath(path)

        window.studio.app.closeSplashscreen()
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    return window.studio.workspace.onChangeWorkspace((path) => {
      setWorkspacePath(path)
    })
  }, [])

  return (
    <WorkspaceContext.Provider value={{ workspacePath }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext)

  if (context === null) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider')
  }

  return context
}
