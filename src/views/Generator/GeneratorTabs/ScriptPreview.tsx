import { Flex, Tooltip } from '@radix-ui/themes'
import { CircleCheckIcon, DownloadIcon } from 'lucide-react'
import { useState } from 'react'

import { GhostButton } from '@/components/GhostButton'
import { ReactMonacoEditor } from '@/components/Monaco/ReactMonacoEditor'
import { RunInCloudButton } from '@/components/RunInCloudDialog/RunInCloudButton'
import { RunInCloudDialog } from '@/components/RunInCloudDialog/RunInCloudDialog'
import { useProxyStatus } from '@/hooks/useProxyStatus'
import { useTrackScriptCopy } from '@/hooks/useTrackScriptCopy'
import { StudioFile } from '@/types'

import { useScriptExport } from '../Generator.hooks'
import { ValidatorDialog } from '../ValidatorDialog'

import { ScriptPreviewError } from './ScriptPreviewError'

interface ScriptPreviewProps {
  file: StudioFile
  preview: string
  error: Error | undefined
}

export function ScriptPreview({ file, preview, error }: ScriptPreviewProps) {
  const [isRunInCloudDialogOpen, setIsRunInCloudDialogOpen] = useState(false)
  const [isValidatorDialogOpen, setIsValidatorDialogOpen] = useState(false)
  const proxyStatus = useProxyStatus()

  const isScriptExportable = !error && !!preview

  const handleExportScript = useScriptExport(file.path)
  const handleCopy = useTrackScriptCopy(preview, 'generator')

  return (
    <Flex direction="column" height="100%" position="relative">
      <Flex py="1" px="2" gap="2" align="center" justify="end">
        <Tooltip
          content={`Proxy is ${proxyStatus}`}
          hidden={proxyStatus === 'online'}
        >
          <GhostButton
            disabled={!isScriptExportable || proxyStatus !== 'online'}
            onClick={() => {
              setIsValidatorDialogOpen(true)
            }}
          >
            <CircleCheckIcon />
            Validate
          </GhostButton>
        </Tooltip>
        <GhostButton
          disabled={!isScriptExportable}
          onClick={handleExportScript}
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
      <ReactMonacoEditor
        showToolbar
        defaultLanguage="javascript"
        options={{
          readOnly: true,
        }}
        value={preview}
        onCopy={handleCopy}
      />

      {!!error && <ScriptPreviewError error={error} />}

      {isScriptExportable && (
        <>
          <RunInCloudDialog
            open={isRunInCloudDialogOpen}
            script={{ type: 'raw', name: file.fileName, content: preview }}
            onOpenChange={setIsRunInCloudDialogOpen}
          />
          <ValidatorDialog
            script={preview}
            open={isValidatorDialogOpen}
            onOpenChange={setIsValidatorDialogOpen}
          />
        </>
      )}
    </Flex>
  )
}
