import { Container, Flex } from '@radix-ui/themes'

import { useGeneratorStore } from '@/store/generator'
import { ExecutorOptions } from './components/ExecutorOptions'
import { Executor } from './components/Executor'

export function LoadProfile() {
  const state = useGeneratorStore()

  return (
    <Container align="left" size="1">
      <Flex direction="column" gap="4">
        <Flex gap="3">
          <Executor value={state.executor} />
        </Flex>
        <ExecutorOptions {...state} />
      </Flex>
    </Container>
  )
}
