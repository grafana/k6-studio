import { CodeEditor } from '@/components/Monaco/CodeEditor'
import { useScriptPreview } from '@/hooks/useScriptPreview'
import { Button, Flex } from '@radix-ui/themes'
import { ScriptPreviewError } from './ScriptPreviewError'
import { CheckCircledIcon, DownloadIcon } from '@radix-ui/react-icons'

export function ScriptPreview() {
  const { preview, error } = useScriptPreview()
  const isScriptExportable = !error && !!preview

  return (
    <Flex direction="column" height="100%">
      <Flex p="2" gap="2" justify="end">
        <Button disabled={!isScriptExportable} variant="soft">
          <CheckCircledIcon />
          Validate
        </Button>
        <Button disabled={!isScriptExportable} variant="soft">
          <DownloadIcon />
          Export
        </Button>
      </Flex>
      {error ? (
        <ScriptPreviewError error={error} />
      ) : (
        <CodeEditor readOnly value={preview} />
      )}
    </Flex>
  )
}
