import { Container, Flex, Heading } from '@radix-ui/themes'

import { useGeneratorStore } from '@/store/generator'
import { ExecutorOptions } from './components/ExecutorOptions'
import { Executor } from './components/Executor'

export function LoadProfile() {
  const state = useGeneratorStore()

  return (
    <Container align="left" size="1" p="2">
      <Flex direction="column" gap="4">
        <Flex direction="column">
          <Heading color="gray" mb="2" size="5">
            General
          </Heading>
          <Flex gap="3">
            <Executor value={state.executor} />
          </Flex>
        </Flex>
        <ExecutorOptions {...state} />
      </Flex>
    </Container>
  )
}
