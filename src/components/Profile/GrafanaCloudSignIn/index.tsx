import { Button, Flex } from '@radix-ui/themes'
import { useCallback, useEffect, useRef, useState } from 'react'

import { UserProfiles } from '@/schemas/profile'
import { UsageEventName } from '@/services/usageTracking/types'
import { SignInProcessState, SignInResult, Stack } from '@/types/auth'
import { exhaustive } from '@/utils/typescript'

import { GrafanaLogo } from '../GrafanaLogo'

import { AuthorizationDenied } from './AuthorizationDenied'
import { AwaitingAuthorization } from './AwaitingAuthorization'
import { FetchingStacks } from './FetchingStacks'
import { FetchingToken } from './FetchingToken'
import { Initializing } from './Initializing'
import { SelectingStack } from './SelectingStack'
import { StackLoginRequired } from './StackLoginRequired'
import { TimedOut } from './TimedOut'
import { UnexpectedError } from './UnexpectedError'

interface SignInProcessProps {
  state: SignInProcessState
  onRetry: () => void
  onSelectStack: (stack: Stack) => void
  onRefreshStacks: (current: Stack) => void
}

export function SignInProcess({
  state,
  onRetry,
  onSelectStack,
  onRefreshStacks,
}: SignInProcessProps) {
  switch (state.type) {
    case 'initializing':
      return <Initializing state={state} />

    case 'awaiting-authorization':
      return <AwaitingAuthorization state={state} />

    case 'authorization-denied':
      return <AuthorizationDenied state={state} onRetry={onRetry} />

    case 'fetching-stacks':
      return <FetchingStacks state={state} />

    case 'selecting-stack':
      return (
        <SelectingStack
          state={state}
          onSelect={onSelectStack}
          onRefresh={onRefreshStacks}
        />
      )

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
  onSignIn: (profiles: UserProfiles) => void
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
        onSignInRef.current(result.profiles)
        window.studio.app.trackEvent({
          event: UsageEventName.UserLoggedIn,
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
    // We need to keep a reference to the latest `onSignIn` callback
    // because the sign in process is long-lived. If we don't do it
    // then we might be acting on an outdated callback when the sign-in
    // is completed.
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

    window.studio.auth.selectStack({
      type: 'select-stack',
      selected: stack,
    })
  }

  const handleStackRefresh = (current: Stack) => {
    window.studio.auth.selectStack({
      type: 'refresh-stacks',
      current,
    })
  }

  return (
    <Flex direction="column" align="center" gap="4" minWidth="300px">
      <GrafanaLogo width="100px" height="100px" />
      <Flex direction="column" align="center" gap="3">
        <SignInProcess
          state={state}
          onRetry={handleRetry}
          onSelectStack={handleStackSelect}
          onRefreshStacks={handleStackRefresh}
        />
        <Button variant="ghost" onClick={handleAbort}>
          Cancel
        </Button>
      </Flex>
    </Flex>
  )
}
