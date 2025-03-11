import { Flex } from '@radix-ui/themes'
import { useState } from 'react'

import { CodeEditor } from '@/components/Monaco/CodeEditor'
import { useScriptPreview } from '@/hooks/useScriptPreview'
import { ScriptPreviewError } from './ScriptPreviewError'
import { CheckCircledIcon, DownloadIcon } from '@radix-ui/react-icons'
import { ValidatorDialog } from '../ValidatorDialog'
import { ExportScriptDialog } from '../ExportScriptDialog'
import { exportScript } from '../Generator.utils'
import { RunInCloudButton } from '@/components/RunInCloudDialog/RunInCloudButton'
import { RunInCloudDialog } from '@/components/RunInCloudDialog/RunInCloudDialog'
import { GhostButton } from '@/components/GhostButton'

export function ScriptPreview() {
  const [isRunInCloudDialogOpen, setIsRunInCloudDialogOpen] = useState(false)
  const [isValidatorDialogOpen, setIsValidatorDialogOpen] = useState(false)
  const [isExportScriptDialogOpen, setIsExportScriptDialogOpen] =
    useState(false)
  const { preview, error } = useScriptPreview()
  const isScriptExportable = !error && !!preview

  return (
    <Flex direction="column" height="100%">
      <Flex py="1" px="2" gap="2" align="center" justify="end">
        <GhostButton
          disabled={!isScriptExportable}
          onClick={() => {
            setIsValidatorDialogOpen(true)
          }}
        >
          <CheckCircledIcon />
          Validate
        </GhostButton>
        <GhostButton
          disabled={!isScriptExportable}
          onClick={() => {
            setIsExportScriptDialogOpen(true)
          }}
        >
          <DownloadIcon />
          Export
        </GhostButton>
        <RunInCloudButton
          variant="outline"
          disabled={!isScriptExportable}
          onClick={() => {
            setIsRunInCloudDialogOpen(true)
          }}
        />
      </Flex>
      {error ? (
        <ScriptPreviewError error={error} />
      ) : (
        <CodeEditor readOnly value={preview} />
      )}
      {isScriptExportable && (
        <>
          <RunInCloudDialog
            open={isRunInCloudDialogOpen}
            script={{ type: 'raw', content: preview }}
            onOpenChange={setIsRunInCloudDialogOpen}
          />
          <ValidatorDialog
            script={preview}
            open={isValidatorDialogOpen}
            onOpenChange={setIsValidatorDialogOpen}
          />
          <ExportScriptDialog
            onExport={exportScript}
            open={isExportScriptDialogOpen}
            onOpenChange={setIsExportScriptDialogOpen}
          />
        </>
      )}
    </Flex>
  )
}
