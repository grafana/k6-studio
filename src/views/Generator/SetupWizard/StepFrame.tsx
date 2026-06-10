import { Flex, Heading, Text } from '@radix-ui/themes'
import { PropsWithChildren } from 'react'

import { STEP_CONFIG } from './constants'
import { StepId } from './state/types'

interface StepFrameProps {
  stepId: StepId
}

export function StepFrame({ stepId, children }: PropsWithChildren<StepFrameProps>) {
  const { icon: Icon, title, description } = STEP_CONFIG[stepId]

  return (
    <Flex direction="column" flexGrow="1" css={{ minHeight: 0 }} overflowY="auto">
      <Flex
        direction="column"
        width="100%"
        maxWidth="860px"
        mx="auto"
        px="5"
        pt="5"
        pb="2"
        flexGrow="1"
      >
        <Flex gap="3" align="start" mb="5">
          <Flex
            align="center"
            justify="center"
            flexShrink="0"
            css={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-3)',
              backgroundColor: 'var(--orange-3)',
              color: 'var(--orange-11)',
            }}
          >
            <Icon size={20} />
          </Flex>
          <Flex direction="column" gap="1">
            <Heading size="4">{title}</Heading>
            <Text size="2" color="gray">
              {description}
            </Text>
          </Flex>
        </Flex>
        {children}
      </Flex>
    </Flex>
  )
}
