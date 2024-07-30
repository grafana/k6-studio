import { Flex, Heading, ScrollArea } from '@radix-ui/themes'

import { LogView } from '@/components/LogView'
import { K6Log } from '@/types'
import { useAutoScroll } from '@/hooks/useAutoScroll'

interface LogsPaneContentProps {
  logs: K6Log[]
}

export function LogsPaneContent({ logs }: LogsPaneContentProps) {
  const ref = useAutoScroll(logs)

  return (
    <Flex maxHeight="100%" direction="column" p="2">
      <Heading size="2" mb="2">
        Logs
      </Heading>
      <ScrollArea scrollbars="vertical">
        <div ref={ref}>
          <LogView logs={logs} />
        </div>
      </ScrollArea>
    </Flex>
  )
}
