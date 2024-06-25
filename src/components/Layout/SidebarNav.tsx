import { Box, Button, Flex, Separator, Text } from '@radix-ui/themes'
import { useNavigate } from 'react-router-dom'

export function SidebarNav() {
  const navigate = useNavigate()

  return (
    <Flex
      width="200px"
      minWidth="200px"
      align="center"
      direction="column"
      style={{ borderRight: '1px solid var(--gray-4)' }}
    >
      <Box pt="3" pb="2">
        <Text size="3" weight="bold" color="violet">
          Workspace
        </Text>
      </Box>
      <Separator size="4" style={{ backgroundColor: 'var(--gray-4)' }} />

      <Flex direction="column" width="100%" p="3" gap="1">
        <Button
          variant="solid"
          onClick={() => {
            navigate('recorder')
          }}
        >
          <Text>Recorder</Text>
        </Button>
        <Button
          variant="solid"
          onClick={() => {
            navigate('validator')
          }}
        >
          <Text>Validator</Text>
        </Button>
      </Flex>
    </Flex>
  )
}
