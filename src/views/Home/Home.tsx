import { Button, Flex, Grid, Text } from '@radix-ui/themes'
import { NavigationCard } from './NavigationCard'
import { createNewGeneratorFile } from '@/utils/generator'
import { useNavigate } from 'react-router-dom'
import { getRoutePath } from '@/routeMap'
import { css } from '@emotion/react'
import {
  CheckCircledIcon,
  DiscIcon,
  PlusCircledIcon,
} from '@radix-ui/react-icons'
import { generateFileNameWithTimestamp } from '@/utils/file'

export function Home() {
  const navigate = useNavigate()

  async function handleCreateTestGenerator() {
    const newGenerator = createNewGeneratorFile()
    const generatorPath = await window.studio.generator.saveGenerator(
      JSON.stringify(newGenerator, null, 2),
      generateFileNameWithTimestamp('json', 'Generator')
    )

    navigate(
      getRoutePath('generator', { path: encodeURIComponent(generatorPath) })
    )
  }

  function handleNavigateToRecorder() {
    navigate(getRoutePath('recorder'))
  }

  // TODO: offer to select a script to validate
  function handleNavigateToValidator() {
    navigate(getRoutePath('validator', {}))
  }

  return (
    <Flex direction="column" align="center" justify="center" height="100%">
      <Text size="8">Discover what you can do with k6 Studio</Text>
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
        Uncover bottlenecks, accelerate load times, and deliver exceptional user
        experiences with the industry{"'"}s leading performance testing tool.
      </Text>
      <Grid gap="8" columns="3" maxWidth="720px">
        <NavigationCard
          title="Recorder"
          description="Use our built-in proxy to record a user flow"
        >
          <Button variant="ghost" onClick={handleNavigateToRecorder}>
            <DiscIcon />
            Record flow
          </Button>
        </NavigationCard>
        <NavigationCard
          title="Generator"
          description="Transform a recorded flow into a k6 test script"
        >
          <Button variant="ghost" onClick={handleCreateTestGenerator}>
            <PlusCircledIcon />
            Generate test
          </Button>
        </NavigationCard>
        <NavigationCard
          title="Validator"
          description="Debug and validate your k6 script"
        >
          <Button variant="ghost" onClick={handleNavigateToValidator}>
            <CheckCircledIcon /> Validate script
          </Button>
        </NavigationCard>
      </Grid>
    </Flex>
  )
}
