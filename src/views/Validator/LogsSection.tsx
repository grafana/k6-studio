import { ScrollArea } from '@radix-ui/themes'

import { LogView } from '@/components/LogView'
import { K6Log } from '@/types'
import { useAutoScroll } from '@/hooks/useAutoScroll'

interface LogsSectionProps {
  logs: K6Log[]
}

export function LogsSection({ logs }: LogsSectionProps) {
  const ref = useAutoScroll(logs)

  return (
    <ScrollArea scrollbars="vertical">
      <div ref={ref}>
        <LogView logs={logs} />
      </div>
    </ScrollArea>
  )
}
