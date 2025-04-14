import { CheckCircledIcon, DownloadIcon } from '@radix-ui/react-icons'
import { Flex, Tooltip } from '@radix-ui/themes'
import { useState } from 'react'

import { GhostButton } from '@/components/GhostButton'
import { CodeEditor } from '@/components/Monaco/CodeEditor'
import { RunInCloudButton } from '@/components/RunInCloudDialog/RunInCloudButton'
import { RunInCloudDialog } from '@/components/RunInCloudDialog/RunInCloudDialog'
import { useProxyStatus } from '@/hooks/useProxyStatus'
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
  const proxyStatus = useProxyStatus()
  const isScriptExportable = !error && !!preview

  return (
    <Flex direction="column" height="100%" position="relative">
      <Flex py="1" px="2" gap="2" align="center" justify="end">
        <Tooltip
          content={`Proxy is ${proxyStatus}`}
          hidden={proxyStatus === 'online'}
        >
          <span>
            <GhostButton
              disabled={!isScriptExportable || proxyStatus !== 'online'}
              onClick={() => {
                setIsValidatorDialogOpen(true)
              }}
            >
              <CheckCircledIcon />
              Validate
            </GhostButton>
          </span>
        </Tooltip>
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
      <CodeEditor readOnly value={preview} />

      {!!error && <ScriptPreviewError error={error} />}

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
