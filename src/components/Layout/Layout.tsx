import {
  Box,
  Text,
  Flex,
  Button,
  Separator,
  ScrollArea,
} from '@radix-ui/themes'
import { Recorder } from '@/views/Recorder'
import { useState } from 'react'
import { Validator } from '@/views/Validator/Validator'

export function Layout() {
  const [tab, setTab] = useState('recorder')
  return (
    <Flex overflow="hidden" maxWidth="100%">
      <Flex
        width="200px"
        minWidth="200px"
        align="center"
        direction="column"
        style={{ borderRight: '1px solid var(--gray-4)' }}
      >
        <Box pt="3" pb="2">
          <Text size="6" weight="bold" color="violet">
            k6 studio
          </Text>
        </Box>
        <Separator size="4" style={{ backgroundColor: 'var(--gray-4)' }} />

        <Flex direction="column" width="100%" p="3" gap="1">
          <Button
            onClick={() => setTab('recorder')}
            variant={tab === 'recorder' ? 'solid' : 'soft'}
          >
            <Text>Recorder</Text>
          </Button>
          <Button
            onClick={() => setTab('validator')}
            variant={tab === 'validator' ? 'solid' : 'soft'}
          >
            <Text>Validator</Text>
          </Button>
        </Flex>
      </Flex>

      <Flex flexGrow="1" style={{ backgroundColor: 'var(--gray-3)' }} asChild>
        <ScrollArea style={{ height: '100dvh' }} scrollbars="vertical">
          <Box
            style={{
              backgroundColor: '#fff',
              borderRadius: 'var(--radius-1)',
              border: '1px solid var(--gray-4)',
            }}
            p="4"
            m="4"
          >
            {tab === 'recorder' && <Recorder />}
            {tab === 'validator' && <Validator />}
          </Box>
        </ScrollArea>
      </Flex>
    </Flex>
  )
}
