import { Flex } from '@radix-ui/themes'

import { ReactMonacoEditor } from '@/components/Monaco/ReactMonacoEditor'
import { ScriptPreview as ScriptPreviewType } from '@/hooks/useScriptPreview'
import { useTrackScriptCopy } from '@/hooks/useTrackScriptCopy'

import { ScriptPreviewError } from './ScriptPreviewError'

interface ScriptPreviewProps {
  script: ScriptPreviewType
}

export function ScriptPreview({ script }: ScriptPreviewProps) {
  const preview = script.valid ? script.preview : ''
  const error = script.valid ? undefined : script.error

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
