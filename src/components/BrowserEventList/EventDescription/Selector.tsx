import { getNodeSelector } from '@/codegen/browser/selectors'
import { Locator } from '@/components/Browser/Locator'
import { ActionLocator } from '@/main/runner/schema'
import { ElementSelector } from '@/schemas/recording'
import { useIsRecording } from '@/views/Recorder/RecordingContext'

interface SelectorProps {
  selectors: ElementSelector
  onHighlight: (selector: ActionLocator | null) => void
}

export function Selector({ selectors, onHighlight }: SelectorProps) {
  const isRecording = useIsRecording()
  const locator = getNodeSelector(selectors)

  const handleHighlightChange = (highlighted: boolean) => {
    if (!highlighted) {
      onHighlight(null)

      return
    }

    onHighlight(locator)
  }

  return (
    <Locator
      locator={locator}
      onHighlightChange={isRecording ? handleHighlightChange : undefined}
    />
  )
}
