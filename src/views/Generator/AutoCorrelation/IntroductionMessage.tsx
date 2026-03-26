import { Badge, Button, Callout, Flex, Text, Tooltip } from '@radix-ui/themes'
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  KeyIcon,
  LinkIcon,
  UnlinkIcon,
  WandSparkles,
} from 'lucide-react'

import grotIllustration from '@/assets/grot-magic.svg'
import {
  cancelAssistantSignIn,
  useAssistantAuthStatus,
  useAssistantSignIn,
  useAssistantSignOut,
} from '@/hooks/useAssistantAuth'
import { useProxyStatus } from '@/hooks/useProxyStatus'
import { useSettings } from '@/hooks/useSettings'
import { useFeaturesStore } from '@/store/features'
import { useStudioUIStore } from '@/store/ui'

interface IntroductionMessageProps {
  onStart: () => void
}

export function IntroductionMessage({ onStart }: IntroductionMessageProps) {
  const isGrafanaAssistant = useFeaturesStore(
    (state) => state.features['grafana-assistant']
  )

  if (isGrafanaAssistant) {
    return <GrafanaAssistantIntro />
  }

  return <OpenAiIntro onStart={onStart} />
}

function OpenAiIntro({ onStart }: IntroductionMessageProps) {
  const openSettingsDialog = useStudioUIStore(
    (state) => state.openSettingsDialog
  )
  const { data: settings } = useSettings()
  const isAiConfigured = !!settings?.ai.apiKey
  const proxyStatus = useProxyStatus()

  return (
    <IntroLayout>
      {isAiConfigured && (
        <AnalyzeButton onStart={onStart} proxyStatus={proxyStatus} />
      )}
      {!isAiConfigured && (
        <>
          <Text size="2" color="gray">
            To use autocorrelation, configure your OpenAI API key first.
          </Text>

          <Button onClick={() => openSettingsDialog('ai')} size="3">
            <KeyIcon />
            Add OpenAI API key
          </Button>
        </>
      )}
      <Text size="1" color="gray" mt="1">
        This feature is in public preview and subject to change.
      </Text>
    </IntroLayout>
  )
}

function GrafanaAssistantIntro() {
  const { data: authStatus, isLoading } = useAssistantAuthStatus()
  const {
    mutate: signIn,
    isPending: isSigningIn,
    error: signInError,
  } = useAssistantSignIn()
  const { mutate: signOut, isPending: isSigningOut } = useAssistantSignOut()

  const isAuthenticated = authStatus?.authenticated ?? false
  const isSignedIn = !!authStatus?.stackId

  return (
    <IntroLayout subtitle="Powered by Grafana Assistant">
      <AssistantAuthStatus
        isLoading={isLoading}
        isSignedIn={isSignedIn}
        isAuthenticated={isAuthenticated}
        isSigningIn={isSigningIn}
        isSigningOut={isSigningOut}
        onSignIn={() => signIn()}
        onCancelSignIn={cancelAssistantSignIn}
        onSignOut={signOut}
      />
      {signInError && (
        <Callout.Root color="red" size="1">
          <Callout.Icon>
            <AlertTriangleIcon size={16} />
          </Callout.Icon>
          <Callout.Text>{signInError.message}</Callout.Text>
        </Callout.Root>
      )}
      <Text size="1" color="gray" mt="1">
        This feature is in public preview and subject to change.
      </Text>
    </IntroLayout>
  )
}

interface AssistantAuthStatusProps {
  isLoading: boolean
  isSignedIn: boolean
  isAuthenticated: boolean
  isSigningIn: boolean
  isSigningOut: boolean
  onSignIn: () => void
  onCancelSignIn: () => void
  onSignOut: () => void
}

function AssistantAuthStatus({
  isLoading,
  isSignedIn,
  isAuthenticated,
  isSigningIn,
  isSigningOut,
  onSignIn,
  onCancelSignIn,
  onSignOut,
}: AssistantAuthStatusProps) {
  if (isLoading) {
    return (
      <Text size="2" color="gray">
        Loading...
      </Text>
    )
  }

  if (!isSignedIn) {
    return (
      <Text size="2" color="gray">
        Sign in to Grafana Cloud to use the Grafana Assistant.
      </Text>
    )
  }

  if (!isAuthenticated) {
    return (
      <Flex align="center" gap="2">
        <Button size="3" onClick={onSignIn} disabled={isSigningIn}>
          <LinkIcon />
          {isSigningIn ? 'Connecting...' : 'Connect to Grafana Assistant'}
        </Button>
        {isSigningIn && (
          <Button
            variant="outline"
            size="3"
            onClick={onCancelSignIn}
            aria-label="Cancel sign in"
          >
            Cancel
          </Button>
        )}
      </Flex>
    )
  }

  return (
    <Flex direction="column" align="center" gap="2">
      <Flex align="center" gap="2">
        <CheckCircleIcon size={16} color="var(--green-9)" />
        <Text size="2">Connected to Grafana Assistant.</Text>
      </Flex>
      <Button
        variant="ghost"
        size="1"
        color="red"
        onClick={onSignOut}
        disabled={isSigningOut}
      >
        <UnlinkIcon size={14} />
        Disconnect
      </Button>
    </Flex>
  )
}

function AnalyzeButton({
  onStart,
  proxyStatus,
}: {
  onStart: () => void
  proxyStatus: string
}) {
  return (
    <Tooltip
      content={`Proxy is ${proxyStatus}`}
      hidden={proxyStatus === 'online'}
    >
      <Button onClick={onStart} size="3" disabled={proxyStatus !== 'online'}>
        <WandSparkles />
        Analyze recording
      </Button>
    </Tooltip>
  )
}

function IntroLayout({
  children,
  subtitle,
}: {
  children: React.ReactNode
  subtitle?: string
}) {
  return (
    <Flex
      direction="column"
      align="center"
      gap="6"
      justify="center"
      height="100%"
    >
      <img
        src={grotIllustration}
        role="img"
        aria-label="Grafana mascot illustration"
        css={{ maxWidth: 250 }}
      />

      <Flex
        direction="column"
        align="center"
        gap="4"
        maxWidth="600px"
        css={{ textAlign: 'center' }}
      >
        <Badge color="orange" variant="soft">
          Feature Preview
        </Badge>
        <Text size="3" weight="bold">
          Automatically correlate dynamic values
        </Text>
        {subtitle && (
          <Text size="2" color="gray">
            {subtitle}
          </Text>
        )}
        <Text size="2" color="gray" mb="2">
          Use AI to automatically handle session IDs, tokens, and other dynamic
          values that would otherwise cause your test scripts to fail.
        </Text>

        <Flex direction="column" gap="2" align="start" width="100%" mb="4">
          <ListItem>Runs validation to identify mismatches</ListItem>
          <ListItem>Detects values that change between runs</ListItem>
          <ListItem>Creates rules to extract and reuse these values</ListItem>
        </Flex>

        {children}
      </Flex>
    </Flex>
  )
}

function ListItem({ children }: { children: React.ReactNode }) {
  return (
    <Flex align="center" gap="2">
      <CheckCircleIcon size={16} color="var(--green-9)" />
      <Text size="2" color="gray">
        {children}
      </Text>
    </Flex>
  )
}
