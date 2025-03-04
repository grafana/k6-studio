import { RunInCloudState } from '@/components/RunInCloud/types'
import { exhaustive } from '@/utils/typescript'
import { EventEmitter } from 'events'
import { getProfileData } from '../auth/fs'
import { waitFor } from '../utils'
import { CloudHandlers, RunInCloudResult } from './types'
import { StackInfo } from '@/schemas/profile'

interface InitializingState {
  type: 'initializing'
}

interface SigningInState {
  type: 'signing-in'
}

interface PreparingState {
  type: 'preparing'
  token: string
  stack: StackInfo
}

interface UploadingState {
  type: 'uploading'
  archivePath: string
  token: string
  stack: StackInfo
}

interface StartingState {
  type: 'starting'
  token: string
  testId: string
  stack: StackInfo
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
  #scriptPath: string

  #controller = new AbortController()
  #signal = this.#controller.signal

  constructor(scriptPath: string) {
    super()

    this.#scriptPath = scriptPath
  }

  async run() {
    let state: State = {
      type: 'initializing',
    }

    while (!this.#signal.aborted) {
      state = await this.#execute(state)

      if (state.type === 'done') {
        return state.result
      }
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
      token,
      stack,
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

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          type: 'uploading',
          archivePath: this.#scriptPath,
          token: state.token,
          stack: state.stack,
        })
      }, 1000)
    })
  }

  async #upload(state: UploadingState): Promise<State> {
    this.emit('state-change', {
      type: 'uploading',
    })

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          type: 'starting',
          token: state.token,
          testId: 'test-id',
          stack: state.stack,
        })
      }, 1000)
    })
  }

  async #start(state: StartingState): Promise<State> {
    this.emit('state-change', {
      type: 'starting',
    })

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          type: 'done',
          result: {
            testRunUrl: `${state.stack.url}/a/k6-app/runs/123`,
          },
        })
      }, 1000)
    })
  }

  abort() {
    this.#controller.abort()
    this.#controller = new AbortController()
  }
}
