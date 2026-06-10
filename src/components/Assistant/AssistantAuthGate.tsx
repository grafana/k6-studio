import { Button, Callout, Flex, Spinner, Text } from '@radix-ui/themes'
import { AlertTriangleIcon, LinkIcon } from 'lucide-react'
import { ReactNode, useState } from 'react'

import { GrafanaIcon } from '@/components/icons/GrafanaIcon'
import { GrafanaCloudSignIn } from '@/components/Profile/GrafanaCloudSignIn'
import {
  invalidateAssistantAuthStatus,
  useAssistantAuthStatus,
  useAssistantSignIn,
} from '@/hooks/useAssistantAuth'
import { useStackHealth } from '@/hooks/useStackHealth'

interface AssistantAuthGateProps {
  /** Rendered once the user is signed in, connected, and the stack is ready. */
  children: ReactNode
}

/**
 * Gates assistant features behind the Grafana Cloud sign-in, assistant
 * connection, and stack-health checks, walking the user through each step.
 */
export function AssistantAuthGate({ children }: AssistantAuthGateProps) {
  const { data: authStatus, isLoading } = useAssistantAuthStatus()
  const [isCloudSigningIn, setIsCloudSigningIn] = useState(false)
  const signIn = useAssistantSignIn()

  const isSignedIn = !!authStatus?.stackId
  const isAuthenticated = authStatus?.authenticated ?? false
  const isAwaitingApproval = !isAuthenticated && signIn.isPending

  if (isLoading) {
    return (
      <Flex align="center" gap="2">
        <Spinner />
        <Text size="2" color="gray">
          Loading...
        </Text>
      </Flex>
    )
  }

  if (!isSignedIn && isCloudSigningIn) {
    return (
      <GrafanaCloudSignIn
        onSignIn={() => {
          setIsCloudSigningIn(false)
          void invalidateAssistantAuthStatus()
        }}
        onAbort={() => setIsCloudSigningIn(false)}
      />
    )
  }

  if (!isSignedIn) {
    return (
      <Flex direction="column" gap="2" width="100%">
        <Button size="3" onClick={() => setIsCloudSigningIn(true)}>
          <GrafanaIcon />
          Sign in to Grafana Cloud
        </Button>
        <Text size="1" color="gray">
          The Assistant requires a Grafana Cloud account.
        </Text>
      </Flex>
    )
  }

  if (isAwaitingApproval) {
    return (
      <Flex direction="column" gap="2" width="100%" align="center">
        <Flex align="center" gap="2">
          <Spinner />
          <Text size="2">Waiting for approval</Text>
        </Flex>
        {signIn.verificationCode !== null && (
          <Text size="2" color="gray">
            Verification code{' '}
            <Text weight="bold">{signIn.verificationCode}</Text>
          </Text>
        )}
        <Button variant="ghost" onClick={signIn.cancel}>
          Cancel
        </Button>
      </Flex>
    )
  }

  if (!isAuthenticated) {
    return (
      <Flex direction="column" gap="2" width="100%">
        <Button size="3" onClick={() => signIn.mutate()}>
          <LinkIcon />
          Connect to Grafana Assistant
        </Button>
        {signIn.error && (
          <Callout.Root color="red" size="1">
            <Callout.Icon>
              <AlertTriangleIcon size={16} />
            </Callout.Icon>
            <Callout.Text>{signIn.error.message}</Callout.Text>
          </Callout.Root>
        )}
      </Flex>
    )
  }

  return <StackHealthGate>{children}</StackHealthGate>
}

function StackHealthGate({ children }: AssistantAuthGateProps) {
  const { isStackReady } = useStackHealth(true)

  if (!isStackReady) {
    return (
      <Flex align="center" gap="2">
        <Spinner />
        <Text size="2" color="gray">
          Your Grafana instance is loading...
        </Text>
      </Flex>
    )
  }

  return children
}
