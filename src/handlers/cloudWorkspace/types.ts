export enum CloudWorkspaceHandlers {
  GetTree = 'cloud-workspace:get-tree',
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

export interface CloudWorkspaceTree {
  stackName: string
  tests: CloudWorkspaceTestEntry[]
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
