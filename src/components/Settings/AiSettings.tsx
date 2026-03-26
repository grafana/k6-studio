import {
  Box,
  Button,
  Callout,
  Flex,
  Separator,
  Text,
  TextField,
} from '@radix-ui/themes'
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeOffIcon,
  InfoIcon,
  KeyIcon,
  LinkIcon,
  TrashIcon,
  UnlinkIcon,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'

import { ExternalLink } from '@/components/ExternalLink'
import { FieldGroup } from '@/components/Form'
import {
  useAssistantAuthStatus,
  useAssistantSignIn,
  useAssistantSignOut,
} from '@/hooks/useAssistantAuth'
import { useSettings } from '@/hooks/useSettings'
import { useFeaturesStore } from '@/store/features'
import { AppSettings } from '@/types/settings'

import { SettingsSection } from './SettingsSection'
import { useEncryptionAvailable } from './useEncryptionAvailable'

export function AiSettings() {
  const {
    formState: { errors },
    control,
    setValue,
    watch,
  } = useFormContext<AppSettings>()

  const { data: savedSettings } = useSettings()
  const [showApiKey, setShowApiKey] = useState(false)
  const isEncryptionAvailable = useEncryptionAvailable()
  const inputRef = useRef<HTMLInputElement>(null)
  const isGrafanaAssistant = useFeaturesStore(
    (state) => state.features['grafana-assistant']
  )

  const currentFormValue = watch('ai.apiKey')

  const hasSavedApiKey = savedSettings?.ai.apiKey !== undefined
  const isFormModified = currentFormValue !== savedSettings?.ai.apiKey
  const isApiKeyConfigured = hasSavedApiKey && !isFormModified

  const handleClearApiKey = () => {
    setValue('ai.apiKey', '', { shouldDirty: true })

    requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
  }

  if (!isEncryptionAvailable) {
    return (
      <SettingsSection>
        <Callout.Root color="orange">
          <Callout.Icon>
            <AlertTriangleIcon size={16} />
          </Callout.Icon>
          <Callout.Text>
            Encryption is not available on this system. AI features require
            secure storage for API keys and cannot be used.
          </Callout.Text>
        </Callout.Root>
      </SettingsSection>
    )
  }

  return (
    <SettingsSection>
      {isGrafanaAssistant && (
        <>
          <GrafanaAssistantConnection />
          <Separator size="4" my="4" />
        </>
      )}
      <DisclaimerTerms />
      <FieldGroup
        name="ai.apiKey"
        label="OpenAI API Key"
        errors={errors}
        hint="Your API key is encrypted using your operating system's secure storage and used for AI-powered test script generation."
        hintType="text"
      >
        <Flex direction="column" gap="3">
          <Controller
            name="ai.apiKey"
            control={control}
            render={({ field }) => (
              <Flex gap="2" align="center">
                <TextField.Root
                  placeholder="sk-..."
                  type={showApiKey ? 'text' : 'password'}
                  value={field.value || ''}
                  onChange={field.onChange}
                  disabled={isApiKeyConfigured}
                  css={{ flex: 1 }}
                  ref={inputRef}
                >
                  <TextField.Slot>
                    <KeyIcon size={16} />
                  </TextField.Slot>
                  {!isApiKeyConfigured && field.value && (
                    <TextField.Slot>
                      <Button
                        variant="ghost"
                        size="1"
                        onClick={() => setShowApiKey((value) => !value)}
                      >
                        {showApiKey ? (
                          <EyeOffIcon size={16} />
                        ) : (
                          <EyeIcon size={16} />
                        )}
                      </Button>
                    </TextField.Slot>
                  )}
                </TextField.Root>
                {isApiKeyConfigured && (
                  <Button
                    variant="outline"
                    color="red"
                    size="2"
                    onClick={handleClearApiKey}
                    aria-label="Remove API key"
                  >
                    <TrashIcon />
                  </Button>
                )}
              </Flex>
            )}
          />

          {!isApiKeyConfigured && (
            <Box>
              <Text size="1" color="gray">
                <strong>Need an API key?</strong> Create one at{' '}
                <ExternalLink href="https://platform.openai.com/api-keys">
                  platform.openai.com/api-keys
                </ExternalLink>
                .
              </Text>
            </Box>
          )}
        </Flex>
      </FieldGroup>
    </SettingsSection>
  )
}

function GrafanaAssistantConnection() {
  const { data: authStatus, isLoading } = useAssistantAuthStatus()
  const { mutate: signIn, isPending: isSigningIn } = useAssistantSignIn()
  const { mutate: signOut, isPending: isSigningOut } = useAssistantSignOut()

  if (isLoading) {
    return null
  }

  const isAuthenticated = authStatus?.authenticated ?? false
  const stackName = authStatus?.stackName

  return (
    <Flex direction="column" gap="3">
      <Text size="3" weight="bold">
        Grafana Assistant
      </Text>
      {isAuthenticated ? (
        <Flex align="center" gap="3">
          <Flex align="center" gap="2" css={{ flex: 1 }}>
            <CheckCircleIcon size={16} color="var(--green-9)" />
            <Text size="2">Connected{stackName ? ` to ${stackName}` : ''}</Text>
          </Flex>
          <Button
            variant="outline"
            color="red"
            size="2"
            onClick={() => signOut()}
            disabled={isSigningOut}
          >
            <UnlinkIcon size={16} />
            Disconnect
          </Button>
        </Flex>
      ) : (
        <Flex direction="column" gap="2">
          {!authStatus?.stackId && (
            <Text size="2" color="gray">
              Sign in to Grafana Cloud first to connect the Grafana Assistant.
            </Text>
          )}
          {authStatus?.stackId && (
            <Button
              size="2"
              onClick={() => signIn()}
              disabled={isSigningIn}
              css={{ alignSelf: 'start' }}
            >
              <LinkIcon size={16} />
              {isSigningIn ? 'Connecting...' : 'Connect to Grafana Assistant'}
            </Button>
          )}
        </Flex>
      )}
    </Flex>
  )
}

function DisclaimerTerms() {
  return (
    <Callout.Root color="gray" mb="3" variant="soft">
      <Callout.Icon>
        <InfoIcon />
      </Callout.Icon>
      <Callout.Text size="2">
        <Text as="p" weight="bold" mb="3">
          Disclaimer: Use of your own OpenAI API Key
        </Text>
        <Box>
          <Text size="1">
            By adding your OpenAI key, you acknowledge and agree to the
            following:
          </Text>
          <ul
            css={{
              paddingLeft: 'var(--space-5)',
              marginBottom: 0,
              marginTop: 'var(--space-2)',
              fontSize: 'var(--font-size-1)',
              li: { marginBottom: 'var(--space-1)' },
            }}
          >
            <li>
              Use of your OpenAI key will be subject to your separate OpenAI
              agreement and any associated billing with respect to such usage.
            </li>
            <li>
              Output is generated through artificial intelligence processes,
              including technology provided by OpenAI, who will process your
              data. More detail can be found in the product documentation.
            </li>
            <li>
              Grafana Labs does not warrant any output to have been tested,
              verified, endorsed, or guaranteed to be accurate, complete, or
              current.
            </li>
            <li>
              You are responsible for the security, management, and activities
              associated with your API key. Your OpenAI key is not transmitted
              to Grafana Labs and Grafana Labs does not store your OpenAI key.
            </li>
          </ul>
        </Box>
      </Callout.Text>
    </Callout.Root>
  )
}
