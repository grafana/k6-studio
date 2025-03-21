import { Flex, Text } from '@radix-ui/themes'

import { VUStages } from './VUStages'

export function RampingVUs() {
  return (
    <Flex direction="column" gap="4">
      <div>
        <Text size="2" as="p">
          A variable number of VUs execute as many iterations as possible for a
          specified amount of time.
        </Text>
      </div>

      <VUStages />
    </Flex>
  )
}
