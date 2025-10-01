import { EventEmitter } from 'events'

import { RunInCloudState } from '@/components/RunInCloudDialog/states/types'
import { TEMP_K6_ARCHIVE_PATH } from '@/constants/workspace'
import { StackInfo } from '@/schemas/profile'
import { ProjectClient } from '@/services/k6/projects'
import { TestClient } from '@/services/k6/tests'
import { CloudCredentials } from '@/services/k6/types'
import { isAbortError } from '@/utils/errors'
import { K6Client } from '@/utils/k6/client'
import { exhaustive } from '@/utils/typescript'

import { getProfileData } from '../auth/fs'
import { waitFor } from '../utils'

import { CloudHandlers, RunInCloudResult } from './types'

interface InitializingState {
  type: 'initializing'
}

interface SigningInState {
  type: 'signing-in'
}

interface PreparingState {
  type: 'preparing'
  stack: StackInfo
  credentials: CloudCredentials
}

interface UploadingState {
  type: 'uploading'
  archivePath: string
  stack: StackInfo
  credentials: CloudCredentials
}

interface StartingState {
  type: 'starting'
  testId: number
  stack: StackInfo
  credentials: CloudCredentials
}

interface DoneState {
  type: 'done'
  result: RunInCloudResult
}

type State =
  | InitializingState
  | SigningInState
  | PreparingState
  | UploadingState
  | StartingState
  | DoneState

interface RunInCloudEventMap {
  'state-change': [RunInCloudState]
}

export class RunInCloudStateMachine extends EventEmitter<RunInCloudEventMap> {
  #testName: string
  #scriptPath: string

  #controller = new AbortController()
  #signal = this.#controller.signal

  #client = new K6Client()

  constructor(scriptPath: string, testName: string) {
    super()

    this.#scriptPath = scriptPath
    this.#testName = testName
  }

  async run(): Promise<RunInCloudResult> {
    try {
      let state: State = {
        type: 'initializing',
      }

      while (!this.#signal.aborted) {
        state = await this.#execute(state)

        if (state.type === 'done') {
          return state.result
        }
      }

      return {
        type: 'aborted',
      }
    } catch (error) {
      if (isAbortError(error)) {
        return {
          type: 'aborted',
        }
      }

      throw error
    }
  }

  #execute(state: State): Promise<State> {
    switch (state.type) {
      case 'initializing':
        return this.#initialize(state)

      case 'signing-in':
        return this.#signIn(state)

      case 'preparing':
        return this.#prepare(state)

      case 'uploading':
        return this.#upload(state)

      case 'starting':
        return this.#start(state)

      case 'done':
        return Promise.resolve(state)

      default:
        return exhaustive(state)
    }
  }

  async #initialize(_state: InitializingState): Promise<State> {
    const profiles = await getProfileData()

    const stack = profiles.profiles.stacks[profiles.profiles.currentStack]

    if (stack === undefined) {
      return {
        type: 'signing-in',
      }
    }

    const token = profiles.tokens[stack.id]

    if (token === undefined) {
      throw new Error('Could not find token for the current stack.')
    }

    return {
      type: 'preparing',
      stack,
      credentials: {
        stackId: stack.id,
        token: token,
      },
    }
  }

  async #signIn(_state: SigningInState): Promise<State> {
    this.emit('state-change', {
      type: 'sign-in',
    })

    await waitFor<StackInfo>({
      event: CloudHandlers.SignedIn,
      signal: this.#signal,
    })

    return {
      type: 'initializing',
    }
  }

  async #prepare(state: PreparingState): Promise<State> {
    this.emit('state-change', {
      type: 'preparing',
    })

    await this.#client.archive({
      scriptPath: this.#scriptPath,
      outputPath: TEMP_K6_ARCHIVE_PATH,
    })

    return {
      type: 'uploading',
      stack: state.stack,
      archivePath: TEMP_K6_ARCHIVE_PATH,
      credentials: state.credentials,
    }
  }

  async #upload(state: UploadingState): Promise<State> {
    this.emit('state-change', {
      type: 'uploading',
    })

    const options = await this.#client.inspect({
      scriptPath: this.#scriptPath,
    })

    const projects = new ProjectClient(state.credentials)
    const tests = new TestClient(state.credentials)

    const name = options?.cloud?.name ?? this.#testName

    const projectId =
      options?.cloud?.projectID ??
      (await projects.findDefault({ signal: this.#signal })).id

    const test = await tests.upload({
      projectId,
      name,
      path: state.archivePath,
      signal: this.#signal,
    })

    return {
      type: 'starting',
      testId: test.id,
      stack: state.stack,
      credentials: state.credentials,
    }
  }

  async #start(state: StartingState): Promise<State> {
    this.emit('state-change', {
      type: 'starting',
    })

    const tests = new TestClient(state.credentials)

    const run = await tests.run({
      testId: state.testId,
      signal: this.#signal,
    })

    return {
      type: 'done',
      result: {
        type: 'started',
        testRunUrl: `${state.stack.url}/a/k6-app/runs/${run.id}`,
      },
    }
  }

  abort() {
    this.#controller.abort()
    this.#controller = new AbortController()
  }
}
