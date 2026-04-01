import {
  Badge,
  Button,
  Callout,
  Flex,
  Spinner,
  Text,
  Tooltip,
} from '@radix-ui/themes'
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  KeyIcon,
  LinkIcon,
  UnlinkIcon,
  WandSparkles,
} from 'lucide-react'
import { useState } from 'react'

import grotIllustration from '@/assets/grot-magic.svg'
import { GrafanaCloudSignIn } from '@/components/Profile/GrafanaCloudSignIn'
import { GrafanaIcon } from '@/components/icons/GrafanaIcon'
import {
  useAssistantAuthStatus,
  useAssistantSignIn,
  useAssistantSignOut,
  invalidateAssistantAuthStatus,
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
    return <GrafanaAssistantIntro onStart={onStart} />
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

function GrafanaAssistantIntro({ onStart }: IntroductionMessageProps) {
  const { data: authStatus, isLoading } = useAssistantAuthStatus()
  const [isCloudSigningIn, setIsCloudSigningIn] = useState(false)

  const isSignedIn = !!authStatus?.stackId

  if (!isSignedIn && isCloudSigningIn) {
    return (
      <Flex direction="column" align="center" justify="center" height="100%">
        <GrafanaCloudSignIn
          onSignIn={() => {
            setIsCloudSigningIn(false)
            void invalidateAssistantAuthStatus()
          }}
          onAbort={() => setIsCloudSigningIn(false)}
        />
      </Flex>
    )
  }

  return (
    <IntroLayout subtitle="Powered by Grafana Assistant">
      <AssistantAuthStatus
        authStatus={authStatus}
        isLoading={isLoading}
        onStart={onStart}
        onSignIn={() => setIsCloudSigningIn(true)}
      />
      <Text size="1" color="gray" mt="1">
        This feature is in public preview and subject to change.
      </Text>
    </IntroLayout>
  )
}

interface AssistantAuthStatusProps {
  authStatus: ReturnType<typeof useAssistantAuthStatus>['data']
  isLoading: boolean
  onStart: () => void
  onSignIn: () => void
}

function AssistantAuthStatus({
  authStatus,
  isLoading,
  onStart,
  onSignIn,
}: AssistantAuthStatusProps) {
  const {
    mutate: signIn,
    isPending: isSigningIn,
    error: signInError,
    cancel: cancelSignIn,
  } = useAssistantSignIn()
  const { mutate: signOut, isPending: isSigningOut } = useAssistantSignOut()
  const proxyStatus = useProxyStatus()

  const isAuthenticated = authStatus?.authenticated ?? false
  const isSignedIn = !!authStatus?.stackId

  if (isLoading) {
    return (
      <Text size="2" color="gray">
        Loading...
      </Text>
    )
  }

  if (!isSignedIn) {
    return (
      <>
        <Text size="2" color="gray">
          Sign in to Grafana Cloud to use the Grafana Assistant.
        </Text>
        <Button size="3" onClick={onSignIn}>
          <GrafanaIcon />
          Sign in to Grafana Cloud
        </Button>
      </>
    )
  }

  if (!isAuthenticated && isSigningIn) {
    return (
      <Flex direction="column" align="center" gap="3">
        <Flex align="center" gap="2">
          <Spinner />
          <Text size="2">Waiting for approval</Text>
        </Flex>
        <Text size="2" color="gray">
          Complete the sign-in in your browser.
        </Text>
        <Button variant="ghost" onClick={cancelSignIn}>
          Cancel
        </Button>
      </Flex>
    )
  }

  if (!isAuthenticated) {
    return (
      <>
        <Button size="3" onClick={() => signIn()}>
          <LinkIcon />
          Connect to Grafana Assistant
        </Button>
        {signInError && (
          <Callout.Root color="red" size="1">
            <Callout.Icon>
              <AlertTriangleIcon size={16} />
            </Callout.Icon>
            <Callout.Text>{signInError.message}</Callout.Text>
          </Callout.Root>
        )}
      </>
    )
  }

  return (
    <Flex direction="column" align="center" gap="2">
      <AnalyzeButton onStart={onStart} proxyStatus={proxyStatus} />
      <Button
        variant="ghost"
        size="1"
        color="red"
        onClick={() => signOut()}
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
