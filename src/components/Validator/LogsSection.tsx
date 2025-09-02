import { ScrollArea } from '@radix-ui/themes'

import { LogView } from '@/components/LogView'
import { useAutoScroll } from '@/hooks/useAutoScroll'
import { K6Log } from '@/types'

interface LogsSectionProps {
  logs: K6Log[]
  autoScroll?: boolean
}

export function LogsSection({ logs, autoScroll = true }: LogsSectionProps) {
  const ref = useAutoScroll(logs, autoScroll)

  return (
    <ScrollArea scrollbars="vertical">
      <div ref={ref}>
        <LogView logs={logs} />
      </div>
    </ScrollArea>
  )
}
