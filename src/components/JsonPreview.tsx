import ReactJson from '@microlink/react-json-view'

import { k6StudioDarkBackground } from '@/components/Monaco/themes/k6StudioDark'
import { k6StudioLightBackground } from '@/components/Monaco/themes/k6StudioLight'
import { useTheme } from '@/hooks/useTheme'

interface JsonPreviewProps {
  content: object
}

export function JsonPreview({ content }: JsonPreviewProps) {
  const theme = useTheme()

  return (
    <ReactJson
      shouldCollapse={(field) => field.name !== 'root'}
      src={content}
      theme={theme === 'dark' ? 'monokai' : 'rjv-default'}
      style={theme === 'dark' ? reactJsonDarkStyles : reactJsonLightStyles}
    />
  )
}

const reactJsonStyles = {
  fontSize: 12,
  height: '100%',
}

const reactJsonDarkStyles = {
  ...reactJsonStyles,
  background: k6StudioDarkBackground,
}

const reactJsonLightStyles = {
  ...reactJsonStyles,
  background: k6StudioLightBackground,
}
