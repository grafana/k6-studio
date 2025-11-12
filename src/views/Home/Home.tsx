import { css } from '@emotion/react'
import { Button, Flex, Grid, Heading, Text } from '@radix-ui/themes'
import { CircleCheckIcon, CirclePlusIcon, DiscIcon } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { GeneratorIcon, RecorderIcon, ValidatorIcon } from '@/components/icons'
import { useCreateGenerator } from '@/hooks/useCreateGenerator'
import { getRoutePath } from '@/routeMap'

import { NavigationCard } from './NavigationCard'

export function Home() {
  const navigate = useNavigate()
  const createNewGenerator = useCreateGenerator()

  const handleCreateNewGenerator = () => createNewGenerator()

  const handleOpenScript = async () => {
    const path = await window.studio.script.showScriptSelectDialog()

    if (!path) {
      return
    }

    navigate(getRoutePath('validator', { fileName: encodeURIComponent(path) }))
  }

  return (
    <Flex direction="column" height="100%">
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
          Discover what you can do with Grafana k6 Studio
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
          Quickly capture user journeys and API requests to generate test
          scripts. No manual scripting required.
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
            <Button variant="ghost" onClick={handleCreateNewGenerator}>
              <CirclePlusIcon />
              Generate test
            </Button>
          </NavigationCard>
          <NavigationCard
            icon={<ValidatorIcon width="52px" height="52px" />}
            title="Validator"
            description="Debug and validate your k6 script"
          >
            <Button variant="ghost" onClick={handleOpenScript}>
              <CircleCheckIcon />
              Open script
            </Button>
          </NavigationCard>
        </Grid>
      </Flex>
    </Flex>
  )
}
