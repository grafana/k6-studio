import { ipcRenderer } from 'electron'

import {
  CloudWorkspaceHandlers,
  CloudWorkspaceTree,
  CloudTestRefString,
} from './types'

export function getTree(): Promise<CloudWorkspaceTree> {
  return ipcRenderer.invoke(CloudWorkspaceHandlers.GetTree) as Promise<CloudWorkspaceTree>
}

export function getScript(ref: CloudTestRefString): Promise<string> {
  return ipcRenderer.invoke(
    CloudWorkspaceHandlers.GetScript,
    ref
  ) as Promise<string>
}

export function saveScript(
  ref: CloudTestRefString,
  source: string
): Promise<void> {
  return ipcRenderer.invoke(
    CloudWorkspaceHandlers.SaveScript,
    ref,
    source
  ) as Promise<void>
}

export function runTest(ref: CloudTestRefString): Promise<string> {
  return ipcRenderer.invoke(
    CloudWorkspaceHandlers.RunTest,
    ref
  ) as Promise<string>
}
