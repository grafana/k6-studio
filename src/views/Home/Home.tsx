import { Flex, Grid, Text } from '@radix-ui/themes'
import { NavigationCard } from './NavigationCard'
import { createNewGeneratorFile } from '@/utils/generator'
import { useNavigate } from 'react-router-dom'
import { getRoutePath } from '@/routeMap'

export function Home() {
  const navigate = useNavigate()

  // TODO: offer to create a new generator or use an existing one
  async function handleCreateTestGenerator() {
    const newGenerator = createNewGeneratorFile()
    const generatorPath = await window.studio.generator.saveGenerator(
      JSON.stringify(newGenerator, null, 2),
      `${new Date().toISOString()}.json`
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
    navigate(getRoutePath('validator'))
  }

  return (
    <Flex direction="column" align="center" justify="center" height="100%">
      <Text size="3" weight="bold" mb="4">
        Welcome to k6 studio 👋
      </Text>
      <Grid gap="3" columns="3" maxWidth="600px">
        <NavigationCard
          title="Record flow"
          description="Use our built-in proxy to record a user flow"
          onClick={handleNavigateToRecorder}
        />
        <NavigationCard
          title="Generate test"
          description="Transform a recorded flow into a k6 test script"
          onClick={handleCreateTestGenerator}
        />
        <NavigationCard
          title="Validate script"
          description="Debug and validate your k6 script"
          onClick={handleNavigateToValidator}
        />
      </Grid>
    </Flex>
  )
}
