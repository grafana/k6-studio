import { Button, Callout, Flex, Spinner, Text } from '@radix-ui/themes'
import { AlertTriangleIcon, LinkIcon, WandSparklesIcon } from 'lucide-react'
import { PropsWithChildren, ReactNode, useState } from 'react'

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
      <GateLayout>
        <GateSpinner label="Loading..." />
      </GateLayout>
    )
  }

  if (!isSignedIn && isCloudSigningIn) {
    return (
      <GateLayout>
        <GrafanaCloudSignIn
          onSignIn={() => {
            setIsCloudSigningIn(false)
            void invalidateAssistantAuthStatus()
          }}
          onAbort={() => setIsCloudSigningIn(false)}
        />
      </GateLayout>
    )
  }

  if (!isSignedIn) {
    return (
      <GateLayout>
        <GateIcon />
        <GateHeading
          title="Sign in to continue"
          description="Guided setup uses the Grafana Assistant, which needs a Grafana Cloud account."
        />
        <Button
          size="3"
          css={{ width: '100%' }}
          onClick={() => setIsCloudSigningIn(true)}
        >
          <GrafanaIcon />
          Sign in to Grafana Cloud
        </Button>
      </GateLayout>
    )
  }

  if (isAwaitingApproval) {
    return (
      <GateLayout>
        <GateSpinner label="Waiting for approval" />
        {signIn.verificationCode !== null && (
          <Text size="2" color="gray">
            Verification code{' '}
            <Text weight="bold">{signIn.verificationCode}</Text>
          </Text>
        )}
        <Button variant="ghost" onClick={signIn.cancel}>
          Cancel
        </Button>
      </GateLayout>
    )
  }

  if (!isAuthenticated) {
    return (
      <GateLayout>
        <GateIcon />
        <GateHeading
          title="Connect to Grafana Assistant"
          description="Approve the connection so the Assistant can analyze your recording."
        />
        <Button
          size="3"
          css={{ width: '100%' }}
          onClick={() => signIn.mutate()}
        >
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
      </GateLayout>
    )
  }

  return <StackHealthGate>{children}</StackHealthGate>
}

function StackHealthGate({ children }: AssistantAuthGateProps) {
  const { isStackReady } = useStackHealth(true)

  if (!isStackReady) {
    return (
      <GateLayout>
        <GateSpinner label="Your Grafana instance is loading..." />
      </GateLayout>
    )
  }

  return children
}

/** Centers the gating message in the available space. */
function GateLayout({ children }: PropsWithChildren) {
  return (
    <Flex
      flexGrow="1"
      align="center"
      justify="center"
      p="6"
      css={{ minHeight: 0 }}
    >
      <Flex
        direction="column"
        align="center"
        gap="4"
        css={{ width: '100%', maxWidth: 360, textAlign: 'center' }}
      >
        {children}
      </Flex>
    </Flex>
  )
}

function GateIcon() {
  return (
    <Flex
      align="center"
      justify="center"
      css={{
        width: 48,
        height: 48,
        borderRadius: 'var(--radius-3)',
        backgroundColor: 'var(--orange-3)',
        color: 'var(--orange-11)',
      }}
    >
      <WandSparklesIcon size={24} />
    </Flex>
  )
}

function GateHeading({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <Flex direction="column" gap="1">
      <Text size="3" weight="bold">
        {title}
      </Text>
      <Text size="2" color="gray">
        {description}
      </Text>
    </Flex>
  )
}

function GateSpinner({ label }: { label: string }) {
  return (
    <Flex align="center" gap="2">
      <Spinner />
      <Text size="2" color="gray">
        {label}
      </Text>
    </Flex>
  )
}
