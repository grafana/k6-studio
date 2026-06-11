import { Locator } from '@/components/Browser/Locator'
import { ElementLocator } from '@/schemas/locator'
import { BrowserEventTarget, ElementSelector } from '@/schemas/recording'
import { getElementLocator } from '@/utils/locator'
import { useIsRecording } from '@/views/Recorder/RecordingContext'

interface SelectorProps {
  selectors: ElementSelector
  frames?: BrowserEventTarget[]
  onHighlight: (locator: ElementLocator | null) => void
}

export function Selector({ selectors, frames, onHighlight }: SelectorProps) {
  const isRecording = useIsRecording()
  const locator = getElementLocator(selectors)
  const frameLocators = (frames ?? []).map((frame) =>
    getElementLocator(frame.selectors)
  )

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
      frames={frameLocators}
      onHighlightChange={isRecording ? handleHighlightChange : undefined}
    />
  )
}
