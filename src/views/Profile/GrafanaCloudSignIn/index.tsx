import { exhaustive } from '@/utils/typescript'
import { Initializing } from './Initializing'
import { AwaitingAuthorization } from './AwaitingAuthorization'
import { FetchingStacks } from './FetchingStacks'
import { SelectingStack } from './SelectingStack'
import { FetchingToken } from './FetchingToken'
import { StackLoginRequired } from './StackLoginRequired'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button, Flex } from '@radix-ui/themes'
import { GrafanaLogo } from '../GrafanaLogo'
import { TimedOut } from './TimedOut'
import { SignInProcessState, SignInResult, Stack } from '@/types/auth'
import { AuthorizationDenied } from './AuthorizationDenied'
import { UnexpectedError } from './UnexpectedError'
import { UserInfo } from '@/schemas/profile'
import { SignOutRequired } from './SignOutRequired'

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

    case 'authorization-denied':
      return <AuthorizationDenied state={state} onRetry={onRetry} />

    case 'sign-out-required':
      return <SignOutRequired state={state} />

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

    case 'unexpected-error':
      return <UnexpectedError state={state} />

    default:
      return exhaustive(state)
  }
}

interface GrafanaCloudSignInProps {
  onSignIn: (user: UserInfo) => void
  onAbort: () => void
}

export function GrafanaCloudSignIn({
  onSignIn,
  onAbort,
}: GrafanaCloudSignInProps) {
  const onSignInRef = useRef(onSignIn)
  const inProgressRef = useRef(false)

  const [state, setState] = useState<SignInProcessState>({
    type: 'initializing',
  })

  const handleSignIn = useCallback((result: SignInResult) => {
    switch (result.type) {
      case 'authenticated':
        onSignInRef.current(result.user)
        break

      case 'conflict':
        setState({
          type: 'sign-out-required',
        })
        break

      case 'timed-out':
        setState({
          type: 'timed-out',
        })
        break

      case 'denied':
        setState({
          type: 'authorization-denied',
        })
        break

      case 'aborted':
        break

      default:
        exhaustive(result)
        break
    }
  }, [])

  const triggerSignIn = useCallback(() => {
    setState({
      type: 'initializing',
    })

    window.studio.auth
      .signIn()
      .then(handleSignIn)
      .catch(() => {
        setState({
          type: 'unexpected-error',
        })
      })
  }, [handleSignIn])

  useEffect(() => {
    // Keep a reference to the latest onSignIn callback.
    onSignInRef.current = onSignIn
  }, [onSignIn])

  useEffect(() => {
    // Make sure we're only triggering the sign-in process once.
    if (inProgressRef.current) {
      return
    }

    inProgressRef.current = true

    triggerSignIn()
  }, [triggerSignIn])

  useEffect(() => {
    return window.studio.auth.onStateChange(setState)
  }, [])

  useEffect(() => {
    return () => {
      window.studio.auth.abortSignIn().catch(() => {
        // Ignore errors when aborting the sign-in process.
      })
    }
  }, [])

  const handleAbort = () => {
    window.studio.auth.abortSignIn().catch(() => {
      setState({
        type: 'unexpected-error',
      })
    })

    onAbort()
  }

  const handleRetry = () => {
    if (state.type !== 'timed-out' && state.type !== 'authorization-denied') {
      return
    }

    triggerSignIn()
  }

  const handleStackSelect = (stack: Stack) => {
    setState({
      type: 'fetching-token',
      stack,
    })

    window.studio.auth.selectStack(stack)
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
