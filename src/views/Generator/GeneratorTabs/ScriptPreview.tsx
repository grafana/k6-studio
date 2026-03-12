import { Flex } from '@radix-ui/themes'

import { ReactMonacoEditor } from '@/components/Monaco/ReactMonacoEditor'
import { useTrackScriptCopy } from '@/hooks/useTrackScriptCopy'

import { ScriptPreviewError } from './ScriptPreviewError'

interface ScriptPreviewProps {
  preview: string
  error: Error | undefined
}

export function ScriptPreview({ preview, error }: ScriptPreviewProps) {
  const handleCopy = useTrackScriptCopy(preview, 'generator')

  return (
    <Flex direction="column" height="100%" position="relative">
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
    </Flex>
  )
}
