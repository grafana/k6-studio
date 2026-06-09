export enum WorkspaceHandler {
  GetFileReferences = 'workspace:get-file-references',
}

export interface FileReferences {
  references: string[]
  referencedBy: string[]
}
