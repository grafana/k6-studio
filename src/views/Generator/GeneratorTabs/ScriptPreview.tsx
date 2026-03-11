import { Flex } from '@radix-ui/themes'

import { ReactMonacoEditor } from '@/components/Monaco/ReactMonacoEditor'
import { useScriptPreview } from '@/hooks/useScriptPreview'
import { useTrackScriptCopy } from '@/hooks/useTrackScriptCopy'

import { ScriptPreviewError } from './ScriptPreviewError'

export function ScriptPreview() {
  const { preview, error } = useScriptPreview()
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
