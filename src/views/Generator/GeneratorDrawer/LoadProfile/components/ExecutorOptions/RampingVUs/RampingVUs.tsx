import { Flex, Heading, Text } from '@radix-ui/themes'
import { VUStages } from './VUStages'
import { RampingVUsOptions } from '@/types/testOptions'

export function RampingVUs({
  stages = [],
}: Omit<RampingVUsOptions, 'executor'>) {
  return (
    <Flex direction="column" gap="4">
      <div>
        <Heading color="gray" mb="1" size="3">
          Ramping VUs
        </Heading>
        <Text size="2">
          A variable number of VUs execute as many iterations as possible for a
          specified amount of time.
        </Text>
      </div>

      <VUStages stages={stages} />
    </Flex>
  )
}
