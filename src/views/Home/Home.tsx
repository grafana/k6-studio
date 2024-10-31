import { Button, Flex, Grid, Heading, Text } from '@radix-ui/themes'
import { Link } from 'react-router-dom'
import { getRoutePath } from '@/routeMap'
import { css } from '@emotion/react'
import {
  CheckCircledIcon,
  DiscIcon,
  PlusCircledIcon,
} from '@radix-ui/react-icons'

import { NavigationCard } from './NavigationCard'
import { GeneratorIcon, RecorderIcon, ValidatorIcon } from '@/components/icons'
import { useCreateGenerator } from '@/hooks/useCreateGenerator'
import { ExperimentalBanner } from '@/components/ExperimentalBanner'

export function Home() {
  const createNewGenerator = useCreateGenerator()

  return (
    <Flex direction="column" height="100%">
      <ExperimentalBanner />
      <Flex
        direction="column"
        align="center"
        justify="center"
        height="100%"
        p="4"
      >
        <Heading
          size="8"
          mb="1"
          css={css`
            font-weight: 400;
          `}
        >
          Discover what you can do with k6 Studio
        </Heading>
        <Text
          css={css`
            color: var(--gray-11);
            font-size: 14px;
            line-height: 22px;
            max-width: 650px;
            text-align: center;
            margin-bottom: var(--space-6);
          `}
        >
          Uncover bottlenecks, accelerate load times, and deliver exceptional
          user experiences with the industry{"'"}s leading performance testing
          tool.
        </Text>
        <Grid gap="8" columns="3" maxWidth="720px">
          <NavigationCard
            icon={<RecorderIcon width="52px" height="52px" />}
            title="Recorder"
            description="Use our built-in proxy to record a user flow"
          >
            <Button variant="ghost" asChild>
              <Link to={getRoutePath('recorder')}>
                <DiscIcon />
                Record flow
              </Link>
            </Button>
          </NavigationCard>
          <NavigationCard
            icon={<GeneratorIcon width="52px" height="52px" />}
            title="Generator"
            description="Transform a recorded flow into a k6 test script"
          >
            <Button variant="ghost" onClick={createNewGenerator}>
              <PlusCircledIcon />
              Generate test
            </Button>
          </NavigationCard>
          <NavigationCard
            icon={<ValidatorIcon width="52px" height="52px" />}
            title="Validator"
            description="Debug and validate your k6 script"
          >
            <Button variant="ghost" asChild>
              <Link to={getRoutePath('validator', {})}>
                <CheckCircledIcon />
                Validate script
              </Link>
            </Button>
          </NavigationCard>
        </Grid>
      </Flex>
    </Flex>
  )
}
