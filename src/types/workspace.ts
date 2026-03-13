import type { WorkspaceConfig } from '@/schemas/workspace'

export interface Workspace {
  path: string
  config: WorkspaceConfig
}
