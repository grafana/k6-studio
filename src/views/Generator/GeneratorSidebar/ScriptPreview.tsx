import { Button, Flex, Switch, Text } from '@radix-ui/themes'
import { Label } from '@/components/Label'
import { useState } from 'react'

import { CodeEditor } from '@/components/Monaco/CodeEditor'
import { useScriptPreview } from '@/hooks/useScriptPreview'
import { ScriptPreviewError } from './ScriptPreviewError'
import { CheckCircledIcon, DownloadIcon } from '@radix-ui/react-icons'
import { ValidatorDialog } from '../ValidatorDialog'
import { ExportScriptDialog } from '../ExportScriptDialog'
import { exportScript } from '../Generator.utils'
import { useEditorWordWrapSetting } from '@/hooks/useEditorWordWrapSetting'

export function ScriptPreview() {
  const [isValidatorDialogOpen, setIsValidatorDialogOpen] = useState(false)
  const [isExportScriptDialogOpen, setIsExportScriptDialogOpen] =
    useState(false)
  const { preview, error } = useScriptPreview()
  const { wordWrap, setWordWrap } = useEditorWordWrapSetting(
    'wordWrapScriptPreview'
  )
  const isScriptExportable = !error && !!preview

  return (
    <Flex direction="column" height="100%">
      <Flex p="2" gap="2" justify="between">
        <Label flexGrow="1">
          <Text size="2">Word-wrap</Text>
          <Switch
            size="1"
            checked={wordWrap === 'on'}
            onCheckedChange={setWordWrap}
          />
        </Label>
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
        <CodeEditor
          options={{
            readOnly: true,
            wordWrap,
          }}
          value={preview}
        />
      )}
      {isScriptExportable && (
        <>
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
