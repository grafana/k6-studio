import { Flex, Heading, Text } from '@radix-ui/themes'

import { SHARED_ITERATIONS_DEFAULTS } from '../../../constants'
import { Iterations } from './Iterations'
import { MaxDuration } from './MaxDuration'
import { VUs } from './VUs'
import { SharedIterationsOptions } from '@/schemas/testOptions'

export function SharedIterations({
  iterations,
  maxDuration,
  vus,
}: Omit<SharedIterationsOptions, 'executor'>) {
  return (
    <Flex direction="column" gap="4">
      <div>
        <Heading color="gray" mb="1" size="3">
          Shared Iterations
        </Heading>
        <Text size="2">
          A fixed number of iterations are {'"shared"'} between a number of VUs,
          and the test ends once all iterations are executed.
        </Text>
      </div>

      <Flex gap="3">
        <VUs
          value={vus}
          placeholder={SHARED_ITERATIONS_DEFAULTS.vus?.toString()}
        />
        <Iterations
          value={iterations}
          placeholder={SHARED_ITERATIONS_DEFAULTS.iterations?.toString()}
        />
        <MaxDuration
          value={maxDuration}
          placeholder={SHARED_ITERATIONS_DEFAULTS.maxDuration}
        />
      </Flex>
    </Flex>
  )
}
