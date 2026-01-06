import { Badge, Button, Flex, Text, Tooltip } from '@radix-ui/themes'
import { CheckCircleIcon, KeyIcon, WandSparkles } from 'lucide-react'

import grotIllustration from '@/assets/grot-magic.svg'
import { useProxyStatus } from '@/hooks/useProxyStatus'
import { useSettings } from '@/hooks/useSettings'
import { useStudioUIStore } from '@/store/ui'

interface IntroductionMessageProps {
  onStart: () => void
}

export function IntroductionMessage({ onStart }: IntroductionMessageProps) {
  const openSettingsDialog = useStudioUIStore(
    (state) => state.openSettingsDialog
  )
  const { data: settings } = useSettings()
  const isAiConfigured = !!settings?.ai.apiKey

  const proxyStatus = useProxyStatus()

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
        <Text size="2" color="gray" mb="2">
          Use AI to automatically handle session IDs, tokens, and other dynamic
          values that would otherwise cause your test scripts to fail.
        </Text>

        <Flex direction="column" gap="2" align="start" width="100%" mb="4">
          <ListItem>Runs validation to identify mismatches</ListItem>
          <ListItem>Detects values that change between runs</ListItem>
          <ListItem>Creates rules to extract and reuse these values</ListItem>
        </Flex>

        {isAiConfigured && (
          <Tooltip
            content={`Proxy is ${proxyStatus}`}
            hidden={proxyStatus === 'online'}
          >
            <Button
              onClick={onStart}
              size="3"
              disabled={proxyStatus !== 'online'}
            >
              <WandSparkles />
              Analyze recording
            </Button>
          </Tooltip>
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
