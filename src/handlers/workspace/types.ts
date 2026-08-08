export enum WorkspaceHandler {
  GetFileReferences = 'workspace:get-file-references',
  UpdateFileReferences = 'workspace:update-file-references',
}

export interface FileReferences {
  references: string[]
  referencedBy: string[]
}

export interface UpdateFileReferencesPayload {
  oldPath: string
  newPath: string
  referencingFiles: string[]
}

export interface UpdateFileReferencesResult {
  updated: number
  failed: number
}
