import { BrowserEvent } from '@/schemas/recording'
import { css } from '@emotion/react'
import { Flex, Table, Button } from '@radix-ui/themes'
import { useState } from 'react'
import { ExportScriptDialog } from '../../Generator/ExportScriptDialog'
import { EventDescription } from './EventDescription'
import { EventIcon } from './EventIcon'

interface BrowserEventLogProps {
  events: BrowserEvent[]
  onExportScript?: (fileName: string) => void
}

export function BrowserEventLog({
  events,
  onExportScript,
}: BrowserEventLogProps) {
  const [showExportDialog, setShowExportDialog] = useState(false)

  function handleExportScriptClick() {
    setShowExportDialog(true)
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

      <Table.Root
        layout="fixed"
        css={css`
          border-top: 1px solid var(--gray-6);
          height: 100%;
        `}
      >
        <Table.Body>
          {events.map((event) => {
            return (
              <Table.Row key={event.eventId}>
                <Table.Cell>
                  <Flex align="center" gap="2">
                    <EventIcon event={event} />
                    <div
                      css={css`
                        flex: 1 1 0;
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                      `}
                    >
                      <EventDescription event={event} />
                    </div>
                  </Flex>
                </Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table.Root>
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
