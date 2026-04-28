import { getElementLocator } from '@/codegen/browser/selectors'
import { Locator } from '@/components/Browser/Locator'
import { ElementLocator } from '@/schemas/locator'
import { ElementSelector } from '@/schemas/recording'
import { useIsRecording } from '@/views/Recorder/RecordingContext'

interface SelectorProps {
  selectors: ElementSelector
  onHighlight: (selector: ElementLocator | null) => void
}

export function Selector({ selectors, onHighlight }: SelectorProps) {
  const isRecording = useIsRecording()
  const locator = getElementLocator(selectors)

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
