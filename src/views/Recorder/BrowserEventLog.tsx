import { Flex, Button, ScrollArea } from '@radix-ui/themes'
import { useState } from 'react'

import { BrowserEventList } from '@/components/BrowserEventList'
import { BrowserEvent } from '@/schemas/recording'

import { ExportScriptDialog } from '../Generator/ExportScriptDialog'

interface BrowserEventLogProps {
  events: BrowserEvent[]
  onExportScript?: (fileName: string) => void
}

export function BrowserEventLog({
  events,
  onExportScript,
}: BrowserEventLogProps) {
  const [showExportDialog, setShowExportDialog] = useState(false)

  const handleExportScriptClick = () => {
    setShowExportDialog(true)
  }

  const handleNavigate = (url: string) => {
    window.studio.browserRemote.navigateTo(url)
  }

  const handleHighlight = (selector: string | null) => {
    window.studio.browserRemote.highlightElement(selector)
  }

  return (
    <Flex direction="column" minHeight="0" height="100%">
      {onExportScript && (
        <Flex justify="end" align="center" p="1" pr="2">
          <Flex gap="2" align="center">
            <Button
              size="2"
              variant="outline"
              onClick={handleExportScriptClick}
            >
              Export script
            </Button>
          </Flex>
        </Flex>
      )}
      <ScrollArea>
        <BrowserEventList
          events={events}
          onNavigate={handleNavigate}
          onHighlight={handleHighlight}
        />
      </ScrollArea>
      {onExportScript && (
        <ExportScriptDialog
          open={showExportDialog}
          scriptName="my-browser-script.js"
          onOpenChange={setShowExportDialog}
          onExport={onExportScript}
        />
      )}
    </Flex>
  )
}
