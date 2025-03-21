import { CheckCircledIcon, DownloadIcon } from '@radix-ui/react-icons'
import { Flex } from '@radix-ui/themes'
import { useState } from 'react'

import { GhostButton } from '@/components/GhostButton'
import { CodeEditor } from '@/components/Monaco/CodeEditor'
import { RunInCloudButton } from '@/components/RunInCloudDialog/RunInCloudButton'
import { RunInCloudDialog } from '@/components/RunInCloudDialog/RunInCloudDialog'
import { useScriptPreview } from '@/hooks/useScriptPreview'

import { ExportScriptDialog } from '../ExportScriptDialog'
import { exportScript } from '../Generator.utils'
import { ValidatorDialog } from '../ValidatorDialog'

import { ScriptPreviewError } from './ScriptPreviewError'

interface ScriptPreviewProps {
  fileName: string
}

export function ScriptPreview({ fileName }: ScriptPreviewProps) {
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
            script={{ type: 'raw', name: fileName, content: preview }}
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
