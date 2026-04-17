import { ipcMain, shell } from 'electron'

import { getProfileData } from '@/handlers/auth/fs'
import { ProjectClient } from '@/services/k6/projects'
import { TestClient } from '@/services/k6/tests'
import { CloudCredentials } from '@/services/k6/types'

import {
  CloudWorkspaceHandlers,
  CloudWorkspaceTree,
  parseCloudTestRef,
} from './types'

async function getCredentials(): Promise<{
  credentials: CloudCredentials
  stackName: string
}> {
  const profiles = await getProfileData()
  const stack = profiles.profiles.stacks[profiles.profiles.currentStack]

  if (stack === undefined) {
    throw new Error('Sign in to Grafana Cloud to use the cloud workspace.')
  }

  const token = profiles.tokens[stack.id]

  if (token === undefined) {
    throw new Error('Could not find token for the current stack.')
  }

  return {
    credentials: {
      stackId: stack.id,
      token,
    },
    stackName: stack.name,
  }
}

export function initialize() {
  ipcMain.handle(
    CloudWorkspaceHandlers.GetTree,
    async (): Promise<CloudWorkspaceTree> => {
      const { credentials, stackName } = await getCredentials()
      const projects = new ProjectClient(credentials)
      const tests = new TestClient(credentials)

      const list = await projects.listAll({})
      const entries: CloudWorkspaceTree['tests'] = []

      for (const project of list.value) {
        const projectTests = await tests.listInProject({
          projectId: project.id,
        })

        for (const t of projectTests) {
          entries.push({
            projectId: t.project_id ?? project.id,
            testId: t.id,
            name: t.name,
          })
        }
      }

      entries.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
      )

      return { stackName, tests: entries }
    }
  )

  ipcMain.handle(
    CloudWorkspaceHandlers.GetScript,
    async (_event, ref: string): Promise<string> => {
      const parsed = parseCloudTestRef(ref)
      if (parsed === null) {
        throw new Error('Invalid cloud test reference.')
      }

      const { credentials } = await getCredentials()
      const tests = new TestClient(credentials)

      return tests.getScriptSource({
        testId: parsed.testId,
      })
    }
  )

  ipcMain.handle(
    CloudWorkspaceHandlers.SaveScript,
    async (_event, ref: string, source: string): Promise<void> => {
      const parsed = parseCloudTestRef(ref)
      if (parsed === null) {
        throw new Error('Invalid cloud test reference.')
      }

      const { credentials } = await getCredentials()
      const tests = new TestClient(credentials)

      await tests.putScriptSource({
        testId: parsed.testId,
        source,
      })
    }
  )

  ipcMain.handle(
    CloudWorkspaceHandlers.RunTest,
    async (_event, ref: string): Promise<string> => {
      const parsed = parseCloudTestRef(ref)
      if (parsed === null) {
        throw new Error('Invalid cloud test reference.')
      }

      const { credentials } = await getCredentials()
      const tests = new TestClient(credentials)

      const run = await tests.run({
        testId: parsed.testId,
      })

      await shell.openExternal(run.test_run_details_page_url)

      return run.test_run_details_page_url
    }
  )
}
