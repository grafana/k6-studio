import { ReadOnlyEditor } from '../../Monaco/ReadOnlyEditor'
import ReactJson from '@microlink/react-json-view'
import { Font } from './Font'
import { useTheme } from '@/hooks/useTheme'

interface PreviewProps {
  content: string
  contentType: string
  format: string
}

export function Preview({ content, contentType, format }: PreviewProps) {
  const theme = useTheme()

  if (format === 'html') {
    return (
      <iframe
        sandbox="allow-same-origin"
        srcDoc={content}
        style={{ width: '100%', height: '100%' }}
      />
    )
  }

  if (format === 'audio') {
    return (
      <audio controls>
        <source src={`data:${contentType};base64,${content}`} />
      </audio>
    )
  }

  if (format === 'font') {
    return <Font url={`data:${contentType};base64,${content}`} />
  }

  if (format === 'image') {
    return (
      <img src={`data:${contentType};base64,${content}`} style={mediaStyles} />
    )
  }

  if (format === 'video') {
    return (
      <video controls style={mediaStyles}>
        <source src={`data:${contentType};base64,${content}`} />
      </video>
    )
  }

  if (format === 'json') {
    return (
      <ReactJson
        shouldCollapse={(field) => field.name !== 'root'}
        style={reactJsonStyles}
        src={JSON.parse(content)}
        theme={theme === 'dark' ? 'brewer' : 'rjv-default'}
      />
    )
  }

  return <ReadOnlyEditor language={format} value={content} />
}

const mediaStyles = {
  display: 'block',
  maxWidth: '100%',
  boxShadow: 'var(--shadow-3)',
}

const reactJsonStyles = {
  fontSize: 12,
}
