export enum CloudWorkspaceHandlers {
  GetTree = 'cloud-workspace:get-tree',
  ListProjectTests = 'cloud-workspace:list-project-tests',
  GetScript = 'cloud-workspace:get-script',
  SaveScript = 'cloud-workspace:save-script',
  RunTest = 'cloud-workspace:run-test',
}

/** Serialized test reference for routes and IPC (`projectId:testId`). */
export type CloudTestRefString = `${number}:${number}`

export interface CloudWorkspaceTestEntry {
  projectId: number
  testId: number
  name: string
}

export interface CloudWorkspaceProjectSummary {
  projectId: number
  name: string
}

export interface CloudWorkspaceTree {
  stackName: string
  /** Projects in the stack (tests are loaded when a folder is expanded). */
  projects: CloudWorkspaceProjectSummary[]
}

export function parseCloudTestRef(ref: string): {
  projectId: number
  testId: number
} | null {
  const match = /^(\d+):(\d+)$/.exec(ref.trim())
  if (!match) {
    return null
  }

  return {
    projectId: Number(match[1]),
    testId: Number(match[2]),
  }
}

export function formatCloudTestRef(
  projectId: number,
  testId: number
): CloudTestRefString {
  return `${projectId}:${testId}`
}
