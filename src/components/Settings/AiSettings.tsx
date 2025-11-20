import { Box, Button, Callout, Flex, Text, TextField } from '@radix-ui/themes'
import {
  AlertTriangleIcon,
  EyeIcon,
  EyeOffIcon,
  KeyIcon,
  TrashIcon,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'

import { ExternalLink } from '@/components/ExternalLink'
import { FieldGroup } from '@/components/Form'
import { useSettings } from '@/hooks/useSettings'
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
