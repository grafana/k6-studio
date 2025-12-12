import { getNodeSelector } from '@/codegen/browser/selectors'
import { Locator } from '@/components/Browser/Locator'
import { ElementSelector } from '@/schemas/recording'
import { useIsRecording } from '@/views/Recorder/RecordingContext'
import { HighlightSelector } from 'extension/src/messaging/types'

interface SelectorProps {
  selectors: ElementSelector
  onHighlight: (selector: HighlightSelector | null) => void
}

export function Selector({ selectors, onHighlight }: SelectorProps) {
  const isRecording = useIsRecording()
  const nodeSelector = getNodeSelector(selectors)

  const handleHighlightChange = (highlighted: boolean) => {
    if (!highlighted) {
      onHighlight(null)

      return
    }

    onHighlight({
      type: 'css',
      selector: selectors.css,
    })
  }

  return (
    <Locator
      locator={nodeSelector}
      onHighlightChange={isRecording ? handleHighlightChange : undefined}
    />
  )
}
