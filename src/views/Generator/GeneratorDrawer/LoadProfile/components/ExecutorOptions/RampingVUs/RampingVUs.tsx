import { Flex, Heading, Text } from '@radix-ui/themes'

import { RampingVUsOptions } from '../../../types'
import { StartVUs } from './StartVUs'
import { GracefulRampDown } from './GracefulRampDown'
import { VUStages } from './VUStages'

export function RampingVUs({
  gracefulRampDown,
  stages = [],
  startVUs,
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

      <Flex gap="3">
        <StartVUs value={startVUs} />
        <GracefulRampDown value={gracefulRampDown} />
      </Flex>

      <VUStages stages={stages} />
    </Flex>
  )
}
