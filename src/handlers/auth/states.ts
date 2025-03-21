import { shell } from 'electron'
import { EventEmitter } from 'node:events'
import { ClientError } from 'openid-client'

import { Profile, StackInfo } from '@/schemas/profile'
import { fetchStacks } from '@/services/grafana'
import { authenticate, GrantedResult } from '@/services/grafana/authenticate'
import { fetchPersonalToken } from '@/services/k6'
import {
  RetryLoginResponse,
  SelectStackResponse,
  SignInProcessState,
  SignInResult,
  Stack,
} from '@/types/auth'
import { exhaustive } from '@/utils/typescript'

import { waitFor } from '../utils'

import { getProfileData, saveProfileData } from './fs'
import { AuthHandler } from './types'

interface AuthorizingState {
  type: 'authorizing'
}

interface SelectingState {
  type: 'selecting'
  grant: GrantedResult
  current: Stack | null
}

interface ExchangingState {
  type: 'exchanging'
  grant: GrantedResult
  stack: Stack
  previousState: SelectingState
}

interface CompletedState {
  type: 'completed'
  result: SignInResult
}

type State =
  | AuthorizingState
  | SelectingState
  | ExchangingState
  | CompletedState

type StateEventMap = {
  'state-change': [SignInProcessState]
}

function wasAborted(error: unknown): boolean {
  return (
    (error instanceof ClientError && error.code == 'OAUTH_ABORT') ||
    (error instanceof Error && error.name === 'AbortError')
  )
}

/**
 * State machine for handling the server side of the sign-in process.
 */
export class SignInStateMachine extends EventEmitter<StateEventMap> {
  #signal: AbortSignal
  #controller: AbortController

  constructor() {
    super()

    this.#controller = new AbortController()
    this.#signal = this.#controller.signal
  }

  async start(): Promise<SignInResult> {
    try {
      return await this.#loop()
    } catch (error) {
      if (wasAborted(error)) {
        return {
          type: 'aborted',
        }
      }

      throw error
    }
  }

  abort() {
    this.#controller.abort()
  }

  async #loop(): Promise<SignInResult> {
    let state: State = {
      type: 'authorizing',
    }

    while (!this.#signal.aborted) {
      state = await this.#execute(state)

      if (state.type !== 'completed') {
        continue
      }

      return state.result
    }

    return {
      type: 'aborted',
    }
  }

  #execute(state: State): Promise<State> {
    switch (state.type) {
      case 'authorizing':
        return this.#authorize()

      case 'selecting':
        return this.#selectStack(state)

      case 'exchanging':
        return this.#exchangeToken(state)

      case 'completed':
        return Promise.resolve(state)

      default:
        return exhaustive(state)
    }
  }

  async #authorize(): Promise<State> {
    const result = await authenticate({
      signal: this.#signal,
      onUserCode: async (verificationUrl, code) => {
        await shell.openExternal(verificationUrl)

        this.emit('state-change', {
          type: 'awaiting-authorization',
          code,
        })
      },
    })

    if (result.type === 'denied') {
      return this.#complete({
        type: 'denied',
      })
    }

    if (result.type === 'timed-out') {
      return this.#complete({
        type: 'timed-out',
      })
    }

    return {
      type: 'selecting',
      grant: result,
      current: null,
    }
  }

  async #selectStack(state: SelectingState): Promise<State> {
    this.emit('state-change', {
      type: 'fetching-stacks',
    })

    const stacks = await fetchStacks(state.grant.token, this.#signal)

    // Skip having to select a stack if there's only one available.
    // We do show the step if the stack is archived though, so that
    // they get instructions on logging in to it.
    if (stacks.length === 1 && stacks[0] && stacks[0].status !== 'archived') {
      return {
        type: 'exchanging',
        grant: state.grant,
        stack: stacks[0],
        previousState: state,
      }
    }

    this.emit('state-change', {
      type: 'selecting-stack',
      current: state.current,
      stacks,
    })

    const stackSelection = await waitFor<SelectStackResponse>({
      event: AuthHandler.SelectStack,
      signal: this.#signal,
    })

    if (stackSelection.type === 'refresh-stacks') {
      return {
        ...state,
        current: stackSelection.current,
      }
    }

    return {
      type: 'exchanging',
      grant: state.grant,
      stack: stackSelection.selected,
      previousState: state,
    }
  }

  async #exchangeToken({
    stack,
    grant,
    previousState,
  }: ExchangingState): Promise<State> {
    this.emit('state-change', {
      type: 'fetching-token',
      stack,
    })

    const apiTokenResponse = await fetchPersonalToken(
      stack,
      grant.token,
      this.#signal
    )

    if (apiTokenResponse.type === 'not-a-member') {
      this.emit('state-change', {
        type: 'stack-login-required',
        stack,
      })

      const response = await waitFor<RetryLoginResponse>({
        event: AuthHandler.RetryStack,
        signal: this.#signal,
      })

      if (response.type === 'abort') {
        return previousState
      }

      return {
        type: 'exchanging',
        grant,
        stack,
        previousState,
      }
    }

    const profileData = await getProfileData()

    const stackInfo: StackInfo = {
      id: stack.id,
      name: stack.name,
      url: stack.url,
      user: {
        name: null,
        email: grant.email,
      },
    }

    const newProfile: Profile = {
      version: '1.0',
      tokens: {
        ...profileData.tokens,
        [stack.id]: apiTokenResponse.token,
      },
      profiles: {
        ...profileData.profiles,
        currentStack: stack.id,
        stacks: {
          ...profileData.profiles.stacks,
          [stack.id]: stackInfo,
        },
      },
    }

    // One last check before saving the profile data.
    if (this.#signal.aborted) {
      return this.#complete({
        type: 'aborted',
      })
    }

    await saveProfileData(newProfile)

    return this.#complete({
      type: 'authenticated',
      current: stackInfo,
      profiles: newProfile.profiles,
    })
  }

  #complete(result: SignInResult): CompletedState {
    return {
      type: 'completed',
      result,
    }
  }
}
