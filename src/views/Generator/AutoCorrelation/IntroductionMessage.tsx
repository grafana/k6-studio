import { Button, Flex, Text } from '@radix-ui/themes'
import { CheckCircleIcon, KeyIcon, WandSparkles } from 'lucide-react'

import grotIllustration from '@/assets/grot-magic.svg'
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

      <Flex direction="column" align="center" gap="4" maxWidth="500px" mt="4">
        <Text size="2" color="gray" align="center">
          AI analyzes your recording and automatically creates correlation rules
          to make your test repeatable.
        </Text>

        <Flex direction="column" gap="2" align="start" width="100%" mb="6">
          <ListItem>Validation runs automatically</ListItem>
          <ListItem>AI analyzes your recording for dynamic values</ListItem>
          <ListItem>
            AI creates correlation rules to make your test repeatable
          </ListItem>
        </Flex>

        {isAiConfigured && (
          <Button onClick={onStart} size="3">
            <WandSparkles />
            Analyze recording
          </Button>
        )}
        {!isAiConfigured && (
          <>
            <Text size="2" color="gray" align="center">
              To use autocorrelation, configure your OpenAI API key first.
            </Text>

            <Button onClick={() => openSettingsDialog('ai')} size="3">
              <KeyIcon />
              Add OpenAI API key
            </Button>
          </>
        )}
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
