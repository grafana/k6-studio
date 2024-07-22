import { ReadOnlyEditor } from '../ReadOnlyEditor'
import { Font } from './Font'

interface PreviewProps {
  content: string
  contentType: string
  format: string
}

export function Preview({ content, contentType, format }: PreviewProps) {
  if (format === 'html') {
    return <div dangerouslySetInnerHTML={{ __html: content }} />
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

  return <ReadOnlyEditor language={format} value={content} />
}

const mediaStyles = {
  display: 'block',
  maxWidth: '100%',
  boxShadow: 'var(--shadow-3)',
}
