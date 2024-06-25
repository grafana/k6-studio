import { Button, Flex, Text } from '@radix-ui/themes'
import { useNavigate } from 'react-router-dom'

export function Home() {
  const navigate = useNavigate()

  return (
    <Flex direction="column" align="center" justify="center" height="100%">
      <Text size="3" weight="bold" mb="4">
        Welcome to k6 studio 👋
      </Text>
      <Flex gap="2">
        <Button
          variant="solid"
          onClick={() => {
            navigate('recorder')
          }}
        >
          Record flow
        </Button>
        <Button
          variant="solid"
          onClick={() => {
            navigate('validator')
          }}
        >
          Validate script
        </Button>
      </Flex>
    </Flex>
  )
}
