import { Box, Button, Flex, Text, TextField } from '@radix-ui/themes'
import {
  CheckCircleIcon,
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

export function AiSettings() {
  const {
    formState: { errors },
    control,
    setValue,
    watch,
  } = useFormContext<AppSettings>()

  const { data: savedSettings } = useSettings()
  const [showApiKey, setShowApiKey] = useState(false)
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

  return (
    <SettingsSection>
      <FieldGroup
        name="ai.apiKey"
        label="OpenAI API Key"
        errors={errors}
        hint="Your API key will be encrypted using your operating system's secure storage and used to generate AI-powered test scripts."
        hintType="text"
      >
        <Flex direction="column" gap="3">
          <Controller
            name="ai.apiKey"
            control={control}
            render={({ field }) => (
              <Flex direction="column" gap="2">
                <Flex gap="2">
                  <TextField.Root
                    placeholder="sk-..."
                    type={showApiKey ? 'text' : 'password'}
                    value={field.value}
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
                </Flex>

                {isApiKeyConfigured && (
                  <Flex gap="2" justify="between" align="center">
                    <Flex align="center" gap="2">
                      <CheckCircleIcon color="green" size={16} />
                      <Text size="2" color="green">
                        API key is configured and encrypted
                      </Text>
                    </Flex>
                    <Button
                      variant="outline"
                      color="red"
                      size="2"
                      onClick={handleClearApiKey}
                    >
                      <TrashIcon size={16} />
                      Change or remove API key
                    </Button>
                  </Flex>
                )}
              </Flex>
            )}
          />

          <Box>
            <Text size="1">
              <strong>Need an API key?</strong> Create one at{' '}
              <ExternalLink href="https://platform.openai.com/api-keys">
                platform.openai.com/api-keys
              </ExternalLink>
              .
            </Text>
          </Box>
        </Flex>
      </FieldGroup>
    </SettingsSection>
  )
}
