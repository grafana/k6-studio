import { exhaustive } from '@/utils/typescript'
import { SignInProcessState, Stack } from './types'
import { Initializing } from './Initializing'
import { AwaitingAuthorization } from './AwaitingAuthorization'
import { FetchingStacks } from './FetchingStacks'
import { SelectingStack } from './SelectingStack'
import { FetchingToken } from './FetchingToken'
import { StackLoginRequired } from './StackLoginRequired'
import { useEffect, useState } from 'react'
import { Button, Flex } from '@radix-ui/themes'
import { GrafanaLogo } from '../GrafanaLogo'
import { TimedOut } from './TimedOut'

interface SignInProcessProps {
  state: SignInProcessState
  onSelect: (stack: Stack) => void
  onRetry: () => void
}

export function SignInProcess({
  state,
  onSelect,
  onRetry,
}: SignInProcessProps) {
  switch (state.type) {
    case 'initializing':
      return <Initializing state={state} />

    case 'awaiting-authorization':
      return <AwaitingAuthorization state={state} />

    case 'fetching-stacks':
      return <FetchingStacks state={state} />

    case 'selecting-stack':
      return <SelectingStack state={state} onSelect={onSelect} />

    case 'fetching-token':
      return <FetchingToken state={state} />

    case 'stack-login-required':
      return <StackLoginRequired state={state} />

    case 'timed-out':
      return <TimedOut state={state} onRetry={onRetry} />

    default:
      return exhaustive(state)
  }
}

interface GrafanaCloudSignInProps {
  onSignIn: () => void
  onAbort: () => void
}

export function GrafanaCloudSignIn({
  onSignIn,
  onAbort,
}: GrafanaCloudSignInProps) {
  const [state, setState] = useState<SignInProcessState>({
    type: 'initializing',
  })

  useEffect(() => {
    setTimeout(() => {
      setState({
        type: 'awaiting-authorization',
        code: '123456',
      })
    }, 2000)
  }, [])

  useEffect(() => {
    if (state.type === 'awaiting-authorization') {
      setTimeout(() => {
        setState({
          type: 'fetching-stacks',
        })
      }, 10000)
    }
  }, [state])

  useEffect(() => {
    if (state.type === 'fetching-stacks') {
      setTimeout(() => {
        setState({
          type: 'selecting-stack',
          stacks: [
            {
              id: '1',
              name: 'Main',
              host: 'grafana.com',
              archived: false,
            },
            {
              id: '2',
              name: 'Personal',
              host: 'grafana.com',
              archived: false,
            },
            {
              id: '3',
              name: 'Archived stack',
              host: 'grafana.com',
              archived: true,
            },
            {
              id: '4',
              name: 'Not signed in to.',
              host: 'grafana.com',
              archived: false,
            },
          ],
        })
      }, 2000)
    }
  }, [state])

  useEffect(() => {
    if (state.type === 'fetching-token') {
      setTimeout(() => {
        if (state.stack.id === '4') {
          setState({
            type: 'stack-login-required',
            stack: state.stack,
          })
        } else {
          onSignIn()
        }
      }, 3000)

      return () => {}
    }
  }, [state, onSignIn])

  useEffect(() => {
    if (state.type === 'timed-out') {
      return
    }

    const timeout = setTimeout(() => {
      setState({
        type: 'timed-out',
      })
    }, 60_000)

    return () => {
      clearTimeout(timeout)
    }
  }, [state])

  const handleAbort = () => {
    onAbort()
  }

  const handleRetry = () => {
    if (state.type === 'timed-out') {
      setState({
        type: 'initializing',
      })
    }
  }

  const handleStackSelect = (stack: Stack) => {
    setState({
      type: 'fetching-token',
      stack,
    })
  }

  return (
    <Flex direction="column" align="center" gap="4" maxWidth="300px">
      <GrafanaLogo width="100px" height="100px" />
      <Flex direction="column" align="center" gap="3">
        <SignInProcess
          state={state}
          onSelect={handleStackSelect}
          onRetry={handleRetry}
        />
        <Button variant="ghost" onClick={handleAbort}>
          Cancel
        </Button>
      </Flex>
    </Flex>
  )
}
