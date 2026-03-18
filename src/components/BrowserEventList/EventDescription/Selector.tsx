import { getNodeSelector } from '@/codegen/browser/selectors'
import { Locator } from '@/components/Browser/Locator'
import { ElementSelector } from '@/schemas/recording'
import { NodeSelector } from '@/schemas/selectors'
import { useIsRecording } from '@/views/Recorder/RecordingContext'

interface SelectorProps {
  selectors: ElementSelector
  onHighlight: (selector: NodeSelector | null) => void
}

export function Selector({ selectors, onHighlight }: SelectorProps) {
  const isRecording = useIsRecording()
  const nodeSelector = getNodeSelector(selectors)

  const handleHighlightChange = (highlighted: boolean) => {
    if (!highlighted) {
      onHighlight(null)

      return
    }

    onHighlight(nodeSelector)
  }

  return (
    <Locator
      locator={nodeSelector}
      onHighlightChange={isRecording ? handleHighlightChange : undefined}
    />
  )
}
