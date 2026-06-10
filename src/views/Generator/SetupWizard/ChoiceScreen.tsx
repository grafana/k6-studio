import { Badge, Button, Card, Flex, Heading, Text } from '@radix-ui/themes'
import {
  ArrowRightIcon,
  CheckIcon,
  LucideIcon,
  SettingsIcon,
  SparklesIcon,
  WandSparklesIcon,
} from 'lucide-react'
import { ReactNode } from 'react'

import { AssistantAuthGate } from '@/components/Assistant/AssistantAuthGate'

interface ChoiceCardProps {
  icon: LucideIcon
  accent?: boolean
  badge?: string
  title: string
  description: string
  bullets: string[]
  action: ReactNode
}

function ChoiceCard({
  icon: Icon,
  accent = false,
  badge,
  title,
  description,
  bullets,
  action,
}: ChoiceCardProps) {
  return (
    <Card
      size="3"
      css={{
        flex: 1,
        maxWidth: 360,
        position: 'relative',
        '&:hover': {
          outline: accent ? '1px solid var(--orange-8)' : undefined,
        },
      }}
    >
      <Flex direction="column" gap="4" height="100%">
        {badge !== undefined && (
          <Badge
            color="orange"
            css={{ position: 'absolute', top: 16, right: 16 }}
          >
            {badge}
          </Badge>
        )}
        <Flex
          align="center"
          justify="center"
          css={{
            width: 52,
            height: 52,
            borderRadius: 'var(--radius-3)',
            backgroundColor: accent ? 'var(--orange-3)' : 'var(--gray-3)',
            color: accent ? 'var(--orange-11)' : 'var(--gray-11)',
          }}
        >
          <Icon size={26} />
        </Flex>
        <Flex direction="column" gap="1">
          <Heading size="4">{title}</Heading>
          <Text size="2" color="gray">
            {description}
          </Text>
        </Flex>
        <Flex direction="column" gap="2">
          {bullets.map((bullet) => (
            <Flex key={bullet} gap="2" align="start">
              <Text
                color={accent ? 'orange' : 'green'}
                css={{ display: 'flex', marginTop: 2 }}
              >
                <CheckIcon size={15} />
              </Text>
              <Text size="1" color="gray">
                {bullet}
              </Text>
            </Flex>
          ))}
        </Flex>
        <Flex mt="auto" pt="2">
          {action}
        </Flex>
      </Flex>
    </Card>
  )
}

interface ChoiceScreenProps {
  onStartGuidedSetup: () => void
  onConfigureManually: () => void
}

export function ChoiceScreen({
  onStartGuidedSetup,
  onConfigureManually,
}: ChoiceScreenProps) {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      flexGrow="1"
      p="6"
      overflowY="auto"
    >
      <Flex direction="column" align="center" gap="2" mb="6" maxWidth="560px">
        <Badge color="orange">
          <SparklesIcon size={12} /> Feature preview
        </Badge>
        <Heading size="6" align="center">
          How do you want to configure this test?
        </Heading>
        <Text size="2" color="gray" align="center">
          Turn your recording into a load test. Let the Grafana Assistant guide
          you through the setup, or configure every rule yourself.
        </Text>
      </Flex>
      <Flex
        gap="5"
        width="100%"
        maxWidth="760px"
        justify="center"
        align="stretch"
      >
        <ChoiceCard
          accent
          badge="Recommended"
          icon={WandSparklesIcon}
          title="Configure with Assistant"
          description="The Assistant analyzes your recording and proposes the hosts, rules and thresholds your test needs."
          bullets={[
            'Suggests which hosts to include',
            'Correlates dynamic values automatically',
            'Finds values to parameterize',
            'Recommends thresholds from real latency',
          ]}
          action={
            <AssistantAuthGate>
              <Button
                size="3"
                css={{ width: '100%' }}
                onClick={onStartGuidedSetup}
              >
                Start guided setup <ArrowRightIcon size={17} />
              </Button>
            </AssistantAuthGate>
          }
        />
        <ChoiceCard
          icon={SettingsIcon}
          title="Configure manually"
          description="Jump straight into the generator and build your rules, parameters and options by hand."
          bullets={[
            'Full control over every rule',
            'Familiar generator workspace',
            'Best when you know the recording',
          ]}
          action={
            <Button
              size="3"
              variant="outline"
              color="gray"
              css={{ width: '100%' }}
              onClick={onConfigureManually}
            >
              Open generator <ArrowRightIcon size={17} />
            </Button>
          }
        />
      </Flex>
      <Flex mt="6" gap="2" align="center">
        <Text
          size="1"
          color="gray"
          css={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <SparklesIcon size={13} /> Assistant is powered by Grafana Cloud · in
          public preview
        </Text>
      </Flex>
    </Flex>
  )
}
