import { css } from '@emotion/react'
import { Button, Flex, Grid, Heading, Text } from '@radix-ui/themes'
import {
  BugPlay,
  CircleCheckIcon,
  DiscIcon,
  ExternalLinkIcon,
  HammerIcon,
  MonitorIcon,
  ServerCogIcon,
  VideoIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { ExternalLink } from '@/components/ExternalLink'
import { useCreateGenerator } from '@/hooks/useCreateGenerator'
import { useOpenExternalScript } from '@/hooks/useOpenExternalScript'
import { getRoutePath } from '@/routeMap'

import { NavigationCard } from './NavigationCard'

export function Home() {
  const createNewGenerator = useCreateGenerator()
  const handleOpenScript = useOpenExternalScript()

  const handleCreateNewGenerator = () => createNewGenerator()

  return (
    <Flex direction="column" height="100%" position="relative">
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
            icon={<VideoIcon />}
            title="Record"
            description="Use our built-in proxy to record a user flow."
          >
            <Button variant="ghost" asChild>
              <Link to={getRoutePath('recorder')}>
                <DiscIcon />
                Record flow
              </Link>
            </Button>
          </NavigationCard>
          <NavigationCard
            icon={<HammerIcon />}
            title="Build"
            description="Create ready-to-run k6 scripts for HTTP or browser testing."
          >
            <Flex gap="6">
              <Button variant="ghost" onClick={handleCreateNewGenerator}>
                <ServerCogIcon />
                HTTP
              </Button>
              <Button variant="ghost">
                <MonitorIcon />
                Browser
              </Button>
            </Flex>
          </NavigationCard>
          <NavigationCard
            icon={<BugPlay />}
            title="Debug"
            description="Debug and validate your k6 script."
          >
            <Button variant="ghost" onClick={handleOpenScript}>
              <CircleCheckIcon />
              Open script
            </Button>
          </NavigationCard>
        </Grid>
      </Flex>
      <Text size="1" mb="4">
        <Flex justify="center" align="center" gap="1" asChild>
          <ExternalLink href="https://grafana.com/docs/k6-studio/">
            Learn more about Grafana k6 Studio <ExternalLinkIcon />
          </ExternalLink>
        </Flex>
      </Text>
    </Flex>
  )
}
