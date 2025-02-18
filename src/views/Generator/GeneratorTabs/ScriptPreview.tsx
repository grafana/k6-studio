import { Button, Flex } from '@radix-ui/themes'
import { useState } from 'react'

import { CodeEditor } from '@/components/Monaco/CodeEditor'
import { useScriptPreview } from '@/hooks/useScriptPreview'
import { ScriptPreviewError } from './ScriptPreviewError'
import { CheckCircledIcon, DownloadIcon } from '@radix-ui/react-icons'
import { ValidatorDialog } from '../ValidatorDialog'
import { ExportScriptDialog } from '../ExportScriptDialog'
import { useGeneratorParams, useScriptExport } from '../Generator.hooks'
import { useGeneratorStore } from '@/store/generator'

export function ScriptPreview() {
  const { fileName } = useGeneratorParams()

  const scriptName = useGeneratorStore((store) => store.scriptName)

  const [isValidatorDialogOpen, setIsValidatorDialogOpen] = useState(false)
  const [isExportScriptDialogOpen, setIsExportScriptDialogOpen] =
    useState(false)
  const { preview, error } = useScriptPreview()
  const isScriptExportable = !error && !!preview

  const handleExportScript = useScriptExport(fileName)

  return (
    <Flex direction="column" height="100%">
      <Flex p="2" gap="2" justify="end">
        <Button
          onClick={() => {
            setIsValidatorDialogOpen(true)
          }}
          disabled={!isScriptExportable}
          variant="soft"
        >
          <CheckCircledIcon />
          Validate
        </Button>
        <Button
          onClick={() => {
            setIsExportScriptDialogOpen(true)
          }}
          disabled={!isScriptExportable}
          variant="soft"
        >
          <DownloadIcon />
          Export
        </Button>
      </Flex>
      {error ? (
        <ScriptPreviewError error={error} />
      ) : (
        <CodeEditor readOnly value={preview} />
      )}
      {isScriptExportable && (
        <>
          <ValidatorDialog
            script={preview}
            open={isValidatorDialogOpen}
            onOpenChange={setIsValidatorDialogOpen}
          />
          <ExportScriptDialog
            open={isExportScriptDialogOpen}
            scriptName={scriptName}
            onExport={handleExportScript}
            onOpenChange={setIsExportScriptDialogOpen}
          />
        </>
      )}
    </Flex>
  )
}
