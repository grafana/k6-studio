import { Flex, Grid, Text } from '@radix-ui/themes'
import { NavigationCard } from './NavigationCard'

export function Home() {
  return (
    <Flex direction="column" align="center" justify="center" height="100%">
      <Text size="3" weight="bold" mb="4">
        Welcome to k6 studio 👋
      </Text>
      <Grid gap="3" columns="3" maxWidth="600px">
        <NavigationCard
          title="Record flow"
          description="Use our built-in proxy to record a user flow"
          to="/recorder"
        />
        <NavigationCard
          title="Generate test"
          description="Transform a recorded flow into a k6 test script"
          to="/generator"
        />
        <NavigationCard
          title="Validate script"
          description="Debug and validate your k6 script"
          to="/validator"
        />
      </Grid>
    </Flex>
  )
}
